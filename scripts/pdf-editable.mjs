/*
PDF-PAGER

Copyright © 2022 Martin Smith

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without 
restriction, including without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

// After a PDF has been rendered, find the div#viewer.pdfViewer element,
// and find each <input> or <textarea> element. The "name" field will specify the specific data element,
// such as "Might" or "Type_Focus_or_Other".
// Some <input> will have "type=checkbox", so then the "checked" attribute needs setting.
// TODO : support <select> fields.
// 
// We need to map the PDF Name field to the Actor data field.

import { PDFCONFIG } from './pdf-config.mjs'

let pdf2actormap;                   // key = pdf field name, value = actor field name
let actor2pdfviewer = new Map();    // key = actorid, value = container

// Function to convert Object into a string whilst keeping the functions
function Obj2String(obj) {
    let ret = "{";
    for (let k in obj) {
        let v = obj[k];
        if (typeof v === "function") {
            ret += v.toString() + ',';
        } else if (v instanceof Array) {
            ret += `"${k}": ${JSON.stringify(v)},` ;
        } else if (typeof v === "object") {
            ret += `"${k}": ${Obj2String(v)},`;
        } else {
            ret += `"${k}": "${v}",`;
        }
    }
    ret += "}";  
    return ret;
}

/**
 * Copy all the data from the specified document (Actor) to the fields on the PDF sheet (container)
 * @param {PDFPageView} pdfpageview  
 * @param {Actor} actor 
 */
async function setFormFromActor(pdfpageview, actor) {
    console.debug(`${PDFCONFIG.MODULE_NAME}: setting values for '${actor.name}'`)
    let container = pdfpageview.div;

    let flags = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.STORE_FIELDS_ON_ACTOR) 
        ? ( actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT) || {} )
        : undefined;

    const inputs = container.querySelectorAll('input,textarea');

    // Set values from the module FLAG on the actor.
    for (let elem of inputs) {
        // don't modify disabled (readonly) fields
        if (elem.disabled) continue; // DISABLED

        // Get required value, either from the FLAGS or from a field on the Actor
        let value;
        if (flags) {
            value = flags[elem.name];
            if (value === undefined) value = flags[elem.id];
        } else {
            const actorfield = pdf2actormap[(elem.name||elem.id).trim()];
            if (actorfield instanceof Object && actorfield.getValue) {
                value = actorfield.getValue(actor);
                if (!actorfield.setValue) elem.readOnly = true;
            } else if (typeof actorfield === 'string') {
                value = foundry.utils.getProperty(actor, actorfield);
                if (typeof value === 'number') value = '' + value;
            }
        }
        //pdfpageview.annotationLayer.annotationStorage.setValue(elem.id, elem);
        if (elem.type === 'checkbox') {
            let newchecked = value || false;
            if (elem.checked == newchecked) continue;
            elem.checked = newchecked;
        } else {
            let newvalue = value || "";
            if (elem.value === newvalue) continue;
            elem.value = newvalue;
        }
    }
}

/**
 * Handle the event which fired when the user changed a value in a field.
 * @param {*} actor 
 * @param {*} inputid 
 * @param {*} inputname 
 * @param {*} value 
 */
function modifyActor(actor, inputid, inputname, value) {
    if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.STORE_FIELDS_ON_ACTOR)) {
        // Copy the modified field to the MODULE FLAG on the Actor
        let flags = actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT);
        if (!flags || !(flags instanceof Object)) flags = {};
        let docfield = inputname || inputid;
        if (flags[docfield] === value) return;
        flags[docfield] = value;
        console.debug(`FLAGS for '${actor.name}': '${inputname || inputid}' = '${value}'`);
        actor.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT, flags);
    } else {
        // Copy the modified field to the corresponding field on the Actor
        let docfield = pdf2actormap[inputname.trim()] || pdf2actormap[inputid.trim()];
        if (!docfield)
            console.debug(`${PDFCONFIG.MODULE_NAME}: unmapped PDF field:\nID '${inputid}', NAME '${inputname}' = '${value}'`)
        else if (typeof docfield === 'string') {
            console.debug(`STRING for '${actor.name}': '${docfield}' = '${value}'`);
            actor.update({ [docfield]: value });
        } else if (docfield.setValue) {
            console.debug(`SETVALUE for '${actor.name}': 'calculated field = '${value}'`);
            docfield.setValue(actor, value);
        }
    }
}

/**
 * Handle updates to actors which are present in one of the open PDF sheets.
 */
Hooks.on('updateActor', async function(actordoc, change, options, userId) {
    let pdfviewer = actor2pdfviewer.get(actordoc.id);
    if (!pdfviewer) return;
    console.log(`${PDFCONFIG.MODULE_NAME}: Update of actor ${actordoc.name}`);
    setFormFromActor(pdfviewer, actordoc);
})

/**
 * Called from renderJournalPDFPageSheet
 * @inheritData renderJournalPDFPageSheet
 */
export async function initEditor(sheet, html, data) {

    const actorid = sheet.object.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
    if (!actorid) return;
    const actor = game.actors.get(actorid);
    if (!actor) return;

    // Load system JSON if not already done (but only if needing to update real Actor fields)
    if (!game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.STORE_FIELDS_ON_ACTOR)) {
        // Always reload the MAP on opening the window (in case it has changed since last time)
        let flag = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG);
        if (flag) pdf2actormap = eval(`(${flag})`);

        if (!pdf2actormap) {
            const module = await import(`../systems/${game.system.id}.mjs`)
                .then(module => {
                    pdf2actormap = module.namemap;
                    let mapping = Obj2String(pdf2actormap);
                    game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, mapping);
                })
                .catch(error => console.warn(`${PDFCONFIG.MODULE_NAME}: Failed to find the PDF mapping file for 'systems/${game.system.id}.mjs'. Form-Filled PDFs will not work`))
        }
        if (!pdf2actormap) return;
    }

    // Wait for the IFRAME to appear in the window before any further initialisation
    $('iframe').on('load', async (event) => {
        console.debug(`${PDFCONFIG.MODULE_NAME}: PDF frame loaded for '${sheet.object.name}'`);

        // Wait for the PDFViewer to be fully initialized
        const contentWindow = event.target.contentWindow;
        // Keep ACTOR->container mapping only while the window is open
        contentWindow.addEventListener('unload', (event) => {
            actor2pdfviewer.delete(actorid);
        })

        const pdfviewerapp = contentWindow.PDFViewerApplication;
        await pdfviewerapp.initializedPromise;
        console.debug(`${PDFCONFIG.MODULE_NAME}: PDFJS initialized`);  // but document still NOT loaded

        // "change" events are NOT sent for fields which have JS Actions attached to them,
        // so we have to attach to the PDF viewer's dispatcheventinsandbox events.
        // 'Action' is for checkboxes
        // 'willCommit' is for text fields
        pdfviewerapp.eventBus.on('dispatcheventinsandbox', (event) => {
            if (event.detail.name == 'Action' || event.detail.willCommit) {
                console.log(`dispatcheventinsandbox: id = '${event.detail.id}', field = '${event.source.data.fieldName}', value = '${event.detail.value}'`);
                modifyActor(actor, event.detail.id, event.source?.data.fieldName, event.detail.value);
            }
        })

        // Wait for the AnnotationLayer to get drawn before populating all the fields with data from the actor.
        pdfviewerapp.eventBus.on('annotationlayerrendered', (event) => {   // from PdfPageView
            console.log(`annotationlayerrendered ${event.pageNumber}`);
            if (!actor2pdfviewer.has(actorid)) actor2pdfviewer.set(actorid, event.source);
            // Page has been rendered, so load the fields on the form with data from the Actor.
            setFormFromActor(event.source, actor);
        })
    })
}

/**
 * Register a mapping of PDF-field to Actor field:
 * e.g.
 * 
 * ui.pdfpager.registerActorMapping({
 *    "CharacterName": "name",
 *    "STR": "system.abilities.str.value",
 *    "DEX": "system.abilities.dex.value",
 *    "CON": "system.abilities.con.value",
 *    "INT": "system.abilities.int.value",
 *    "WIS": "system.abilities.wis.value",
 *    "CHA": "system.abilities.cha.value",
 *    "STRmod": "system.abilities.str.mod",
 *    "DEXmod": "system.abilities.dex.mod",
 *    "CONmod": "system.abilities.con.mod",
 *    "INTmod": "system.abilities.int.mod",
 *    "WISmod": "system.abilities.wis.mod",
 *    "CHamod": "system.abilities.cha.mod"
 * })
 * 
 * @param {Object} mapping 
 */
export function registerActorMapping(mapping) {
    pdf2actormap = mapping;
    game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, Obj2String(pdf2actormap));
}