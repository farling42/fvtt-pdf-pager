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

let map_pdf2actor;                   // key = pdf field name, value = actor field name
let map_pdf2item;                    // key = pdf field name, value = item  field name
let document2pdfviewer = new Map();    // key = document uuid, value = container

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
 * Copy all the data from the specified Document (Actor/Item) to the fields on the PDF sheet (container)
 * @param {PDFPageView} pdfpageview  
 * @param {Document} document An Actor or Item
 */
async function setFormFromDocument(pdfpageview, document) {
    //console.debug(`${PDFCONFIG.MODULE_NAME}: setting values for '${document.name}'`)
    let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT) || {};

    // Set values from the module FLAG on the Document.
    const inputs = pdfpageview.div.querySelectorAll('input,textarea');
    const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
    for (let elem of inputs) {
        // don't modify disabled (readonly) fields
        if (elem.disabled) continue; // DISABLED

        // Get required value, either from the FLAGS or from a field on the Actor
        const docfield = mapping && (mapping[elem.name] || mapping[elem.id]);
        let value;
        if (!docfield) {
            value = flags[elem.name];
            if (value === undefined) value = flags[elem.id];
        } else {
            if (docfield instanceof Object && docfield.getValue) {
                value = docfield.getValue(document);
                if (!docfield.setValue) elem.readOnly = true;
            } else if (typeof docfield === 'string') {
                value = foundry.utils.getProperty(document, docfield);
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
 * @param {Document} document An Actor or Item
 * @param {string} inputid The PDF ID of the field
 * @param {string} inputname  The PDF NAME of the field
 * @param {string} value The value to be stored in the document
 */
function modifyDocument(document, inputid, inputname, value) {
    // Copy the modified field to the corresponding field in the Document
    const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
    let docfield = mapping && (mapping[inputname] || mapping[inputid]);
    if (!docfield) {
        console.debug(`${PDFCONFIG.MODULE_NAME}: unmapped PDF field: NAME '${inputname}' ID '${inputid}', = '${value}'`);
        // Copy the modified field to the MODULE FLAG in the Document
        let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT);
        if (!flags || !(flags instanceof Object)) flags = {};
        let docfield = inputname || inputid;
        if (flags[docfield] === value) return;
        flags[docfield] = value;
        console.debug(`Storing hidden value on '${document.name}': '${docfield}' = '${value}'`);
        document.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT, flags);        
    } else if (typeof docfield === 'string') {
        console.debug(`Updating '${document.name}'['${docfield}'] = '${value}'`);
        if (getProperty(document, docfield) === value) return;
        document.update({ [docfield]: value });
    } else if (docfield.setValue) {
        console.debug(`Calling setValue on field for '${document.name}' with '${value}'`);
        docfield.setValue(document, value);
    }
}

/**
 * Handle updates to actors which are present in one of the open PDF sheets.
 */
async function update_document(document, change, options, userId) {
    let pdfviewer = document2pdfviewer.get(document.uuid);
    if (!pdfviewer) return;
    setFormFromDocument(pdfviewer, document);
}
Hooks.on('updateActor', update_document)
Hooks.on('updateItem',  update_document)

/**
 * Handle a displayed item being deleted, break the connection to the displayed PDF page.
 */
async function delete_document(document, options, userId) {
    console.log(`Item ${document.uuid} was deleted`)
    let pdfviewer = document2pdfviewer.get(document.uuid);
    if (!pdfviewer) return;
    document2pdfviewer.delete(document.uuid);
}
Hooks.on('deleteActor', delete_document)
Hooks.on('deleteItem',  delete_document)


/**
 * Called from renderJournalPDFPageSheet
 * @inheritData renderJournalPDFPageSheet
 */
export async function initEditor(sheet, html, data) {

    const pdfcode = sheet.object.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
    if (!pdfcode) return;
    const document = (pdfcode.includes('.') && await fromUuid(pdfcode)) || game.actors.get(pdfcode) || game.items.get(pdfcode);
    if (!document) return;

    // Always reload the MAP on opening the window (in case it has changed since last time)
    let mapping = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG);
    if (mapping) map_pdf2actor = eval(`(${mapping})`);
    mapping = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ITEM_CONFIG);
    if (mapping) map_pdf2item = eval(`(${mapping})`);

    const systemfile = `/systems/${game.system.id}.mjs`;
    if (!map_pdf2actor && await srcExists(`modules/${PDFCONFIG.MODULE_NAME}${systemfile}`)) {
        const module = await import(`..${systemfile}`)
            .then(module => {
                map_pdf2actor = module.actormap;
                map_pdf2item  = module.itemmap;
                game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, Obj2String(map_pdf2actor));
                game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ITEM_CONFIG,  Obj2String(map_pdf2item));
            })
            .catch(error => console.warn(`${PDFCONFIG.MODULE_NAME}: Failed to find the PDF mapping file for 'systems/${game.system.id}.mjs'.`))
    } else {
        if (!map_pdf2actor) map_pdf2actor = {};
        if (!map_pdf2item)  map_pdf2item  = {};
    }

    // Wait for the IFRAME to appear in the window before any further initialisation
    $('iframe').on('load', async (event) => {
        //console.debug(`${PDFCONFIG.MODULE_NAME}: PDF frame loaded for '${sheet.object.name}'`);

        // Wait for the PDFViewer to be fully initialized
        const contentWindow = event.target.contentWindow;
        // Keep DOCUMENT->container mapping only while the window is open
        contentWindow.addEventListener('unload', (event) => {
            document2pdfviewer.delete(document.uuid);
        })

        const pdfviewerapp = contentWindow.PDFViewerApplication;
        await pdfviewerapp.initializedPromise;
        //console.debug(`${PDFCONFIG.MODULE_NAME}: PDFJS initialized`);  // but document still NOT loaded

        // "change" events are NOT sent for fields which have JS Actions attached to them,
        // so we have to attach to the PDF viewer's dispatcheventinsandbox events.
        // 'Action' is for checkboxes
        // 'willCommit' is for text fields
        pdfviewerapp.eventBus.on('dispatcheventinsandbox', (event) => {
            if (event.detail.name == 'Action' || event.detail.willCommit) {
                //console.log(`dispatcheventinsandbox: id = '${event.detail.id}', field = '${event.source.data.fieldName}', value = '${event.detail.value}'`);
                modifyDocument(document, event.detail.id, event.source?.data.fieldName, event.detail.value);
            }
        })

        // Wait for the AnnotationLayer to get drawn before populating all the fields with data from the Document.
        pdfviewerapp.eventBus.on('annotationlayerrendered', (event) => {   // from PdfPageView
            if (!document2pdfviewer.has(document.uuid)) document2pdfviewer.set(document.uuid, event.source);
            setFormFromDocument(event.source, document);
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
    map_pdf2actor = mapping;
    game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, Obj2String(map_pdf2actor));
}

export function registerItemMapping(mapping) {
    map_pdf2item = mapping;
    game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, Obj2String(map_pdf2item));
}