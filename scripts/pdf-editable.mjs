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
// 
// We need to map the PDF Name field to the Actor data field.

import { PDFCONFIG } from './pdf-config.mjs'

// ???? - immediately copy changes from the Actor to the displayed sheet.

let pdf2actormap;

let actor2containermap = new Map();

/**
 * Copy all the data from the specified document (Actor) to the fields on the PDF sheet (container)
 * @param {*} container 
 * @param {*} document 
 */
function setValues(container, document) {
    console.debug(`${PDFCONFIG.MODULE_NAME}: setting values on '${container}' for '${document.name}'`)
    let inputs = container.querySelectorAll('input,textarea');
    for (let elem of inputs) {
        let curvalue;
        const docfield = pdf2actormap[elem.name.trim()];
        if (docfield instanceof Object) {
            curvalue = docfield.getValue(document);
            if (!docfield.setValue) elem.readOnly = true;
        } else if (docfield) {
            curvalue = foundry.utils.getProperty(document, docfield);
        }
        if (curvalue!==undefined) {
            if (elem.type === 'checkbox') {
                elem.checked = curvalue;
            } else {
                elem.value = curvalue;
            }
        }
    }
}

/**
 * Handle the event which fired when the user changed a value in a field.
 * @param {*} document 
 * @param {*} inputid 
 * @param {*} inputname 
 * @param {*} value 
 */
function updateDocument(document, inputid, inputname, value) {
    let docfield = pdf2actormap[inputname.trim()] || pdf2actormap[inputid.trim()];
    if (!docfield)
        console.debug(`${PDFCONFIG.MODULE_NAME}: unmapped PDF field:\nID '${inputid}', NAME '${inputname}' = '${value}'`)
    else if (typeof docfield === 'string') {
        console.debug(`${PDFCONFIG.MODULE_NAME}: '${document.name}':\n'${docfield}' = '${value}'`);
        document.update({ [docfield]: value });
    } else if (docfield.setValue) {
        console.debug(`${PDFCONFIG.MODULE_NAME}: '${document.name}':\n'calculated field = '${value}'`);
        docfield.setValue(document, value);
    }
}

/**
 * Hook a 'change' listener onto each <input> or <textarea> element in the container.
 * @param {*} container 
 * @param {*} document 
 */

function setListeners(container, document) {
    console.debug(`${PDFCONFIG.MODULE_NAME}: setting listeners on '${container}' for '${document.name}'`)

    // Set listener to update modified value
    let inputs = container.querySelectorAll('input,textarea');
    for (let elem of inputs) {
        //console.log(`Attaching to data field '${elem.name}'`);
        elem.addEventListener('change', (event) => { 
            let value = (event.target.type === 'checkbox') ? event.target.checked : event.target.value;
            //console.log(`change: type = '${event.type}', value = '${value}'`)
            updateDocument(document, elem.id, elem.name, value);
        })
    }
    // Keep ACTOR->container mapping only while the window is open
    actor2containermap.set(document.id, container);
    let topwin = container.ownerDocument.defaultView;
    if (topwin)
        topwin.addEventListener('unload', (event) => {
            actor2containermap.delete(document.id);
        })
    else
        console.error(`${PDFCONFIG.MODULE_NAME}: Failed to find window for PDF page of ${document.id}`);
}

/**
 * Handle updates to actors which are present in one of the open PDF sheets.
 */
Hooks.on('updateActor', async function(actordoc, change, options, userId) {
    let container = actor2containermap.get(actordoc.id);
    if (!container) return;
    // We can't rely on change, since that only identifies the values that were directly changed,
    // it does not include the list of derived fields which might also have changed value.
    console.log(`${PDFCONFIG.MODULE_NAME}: Update of actor ${actordoc.name} for changes ${change}`);
    setValues(container, actordoc);
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

    // Load system JSON if not already done
    if (!pdf2actormap) {
        const module = await import(`../systems/${game.system.id}.mjs`)
            .then(module => pdf2actormap = module.namemap)
            .catch(error => console.warn(`${PDFCONFIG.MODULE_NAME}: Failed to find the PDF mapping file for 'systems/${game.system.id}.mjs'. Form-Filled PDFs will not work`))
    }
    if (!pdf2actormap) return;

    $('iframe').on('load', async (event) => {
        console.debug(`${PDFCONFIG.MODULE_NAME}: PDF frame loaded for '${sheet.object.name}': event '${event}'`);

        // Wait for the PDFViewer to be fully initialized
        let pdfviewer = event.target.contentWindow.PDFViewerApplication;
        await pdfviewer.initializedPromise;
        console.debug(`${PDFCONFIG.MODULE_NAME}: PDFJS initialized`);  // but document still NOT loaded

        // Now wait for the container to get completely populated
        let container = pdfviewer.appConfig.viewerContainer;

        // Check every 2 seconds to see if the child count has changed.
        let childCount = container.children.length;
        let myInterval = setInterval(() => {
            var newChildCount = container.children.length;
            if(childCount < newChildCount ) {
                console.debug(`${PDFCONFIG.MODULE_NAME}: child added - still waiting`);
                childCount = newChildCount;
            } else {
                console.debug(`${PDFCONFIG.MODULE_NAME}: no new children - attaching listeners`);
                setValues(container, actor);
                setListeners(container, actor);
                clearInterval(myInterval);
            }
        }, 500);
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
}