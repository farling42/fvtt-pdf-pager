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
// Some <input> will have "type=checkbox" or "type=radio", so then the "checked" attribute needs setting.
// TODO : support <select> fields.
// 
// We need to map the PDF Name field to the Actor data field.
//
// NOTES:
// AnnotationStorage.setValue is called for each individual character change in a field.
// let hasjsactions = await pdfviewerapp.pdfDocument.hasJSActions();

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


async function getbuttonvalues(pdfviewer) {
    let buttonvalues = new Map();
    for (const pdfpageview of pdfviewer._pages) {
        let annotations = await pdfpageview.pdfPage?.getAnnotations();
        if (annotations) {
            for (const annotation of annotations)
                if (annotation.buttonValue) buttonvalues.set(annotation.id, annotation.buttonValue);
        }
    }
    return buttonvalues;
}


/**
 * Copy all the data from the specified Document (Actor/Item) to the fields on the PDF sheet (container)
 * @param {PDFViewer} pdfviewer  
 * @param {Document} document An Actor or Item
 * @param {Object} options  Can contain either or both of { disabled : true , hidebg : true }
 */
async function setFormFromDocument(pdfviewer, document, options={}) {
    console.debug(`${PDFCONFIG.MODULE_NAME}: loading values from ${document.documentName}(${document.type}) '${document.name}' into PDF`);
    let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT) || {}
    let buttonvalues;  // support for radio buttons

    // Set values from the module FLAG on the Document.
    const inputs = pdfviewer.viewer.querySelectorAll('input,select,textarea');
    const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
    //const storage = pdfpageview.annotationLayer.annotationStorage;
    for (let elem of inputs) {
        if (options.hidebg)   elem.style.setProperty('background-image', 'none');
        if (options.disabled) elem.readOnly = true;

        // don't modify disabled (readonly) fields
        if (elem.disabled) continue; // DISABLED

        // Get required value, either from the FLAGS or from a field on the Actor
        let docfield = mapping && (mapping[elem.name]);
        if (!docfield && getProperty(document, elem.name) !== undefined) docfield = elem.name;
        let value;
        if (!docfield) {
            value = flags[elem.name];
        } else {
            if (docfield instanceof Object && docfield.getValue) {
                value = docfield.getValue(document);
                if (!docfield.setValue) elem.readOnly = true;
            } else if (typeof docfield === 'string') {
                value = getProperty(document, docfield);
                if (typeof value === 'number') value = '' + value;
            }
        }

        // Set required value on the HTML element        
        if (elem.type === 'checkbox') {
            let newchecked = value || false;
            if (elem.checked  == newchecked) continue;
            elem.checked  = newchecked;
            //storage.setValue(elem.id, { value : elem.checked });
        } else if (elem.type === 'radio') {
            if (!buttonvalues) buttonvalues = await getbuttonvalues(pdfviewer);
            let field = buttonvalues.get(elem.id);
            let newvalue = (field === undefined) ? elem.id : field;

            let newchecked = (value == newvalue);
            if (elem.checked == newchecked) continue;
            elem.checked  = newchecked;
            //storage.setValue(elem.id, { value : elem.checked });
        } else {
            let newvalue = value || "";
            if (elem.value === newvalue) continue;
            elem.value = newvalue;
            //storage.setValue(elem.id, { value : elem.value });
        }
    }
}


async function setDocumentFromForm(pdfviewer, document) {
    console.debug(`${PDFCONFIG.MODULE_NAME}: transferring loaded values from PDF into ${document.documentName}(${document.type}) '${document.name}'`);
    const inputs = pdfviewer.viewer.querySelectorAll('input,select,textarea');
    let buttonvalues; // support for radio buttons

    for (const element of inputs) {
        if (element.disabled || element.readOnly) continue;
        // Don't allow editing while the PDF is in this mode
        element.readOnly = true;
        if (element.type === 'checkbox')
            modifyDocument(document, element.name, element.checked);
        else if (element.type === 'radio') {
            // ID of element is stored for the selected RADIO button
            if (!buttonvalues) buttonvalues = await getbuttonvalues(pdfviewer);
            if (element.checked) {
                let newvalue = buttonvalues.get(element.id);
                modifyDocument(document, element.name, (newvalue === undefined) ? element.id : newvalue);
            }
        } else if (element.value) // Don't write empty fields
            modifyDocument(document, element.name, element.value);
    }
}


/**
 * Handle the event which fired when the user changed a value in a field.
 * @param {Document} document An Actor or Item
 * @param {string} fieldname  The PDF NAME of the field
 * @param {string} value      The value to be stored in the document
 */
function modifyDocument(document, fieldname, value) {
    // Copy the modified field to the corresponding field in the Document
    let docfield;
    const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
    docfield = mapping?.[fieldname];
    if (!docfield && getProperty(document, fieldname) !== undefined) docfield = fieldname;

    if (!docfield) {
        // Copy the modified field to the MODULE FLAG in the Document
        let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT);
        if (!(flags instanceof Object)) flags = {};
        if (flags[fieldname] === value) return;
        console.debug(`Hiding value '${document.name}'['${fieldname}'] = '${value}'`);
        flags[fieldname] = value;
        document.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT, flags);
    } else if (typeof docfield === 'string') {
        let currentvalue = getProperty(document, docfield)
        // Maybe convert PDF value into the correct Document type
        if (typeof value !== typeof currentvalue) {
            switch (typeof currentvalue) {
                case 'number':  value = Number(value);  break;
                case 'boolean': value = Boolean(value); break;
                case 'string':  value = String(value);  break;
            }
        }
        if (currentvalue === value) return;
        console.debug(`Setting '${document.name}'['${docfield}'] = '${value}'`);
        // It doesn't seem like we can prevent calling document.update twice
        // when the change is received by both 'dispatcheventinsandbox' and the 'change' event handler.
        // calling setProperty(document,docfield,value) doesn't retain the value.
        document.update({ [docfield]: value });
    } else if (docfield.setValue) {
        console.debug(`Calling setValue function for '${document.name}'['${fieldname}'] with '${value}'`);
        docfield.setValue(document, value);
    }
}

/**
 * Handle updates to actors which are present in one of the open PDF sheets.
 */
async function update_document(document, change, options, userId) {
    let pdfviewer = document2pdfviewer.get(document.uuid);
    if (!pdfviewer) return;
    if (!game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.READ_FIELDS_FROM_PDF))
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
    ui.notifications.warn(game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Warning.ThingDeleted`).replace('%1', document.name));
    document2pdfviewer.delete(document.uuid);
}
Hooks.on('deleteActor', delete_document)
Hooks.on('deleteItem',  delete_document)


/**
 * Called from renderJournalPDFPageSheet
 * @param {jQuery} html The iframe for the PDF Page
 * @param {String} id_to_display The UUID of the Actor or Item to be displayed in the Form Fillable PDF
 * @inheritData renderJournalPDFPageSheet
 */
export async function initEditor(html, id_to_display) {

    const document = (id_to_display.includes('.') && await fromUuid(id_to_display)) || game.actors.get(id_to_display) || game.items.get(id_to_display);
    if (!document) return;

    // Always reload the MAP on opening the window (in case it has changed since last time)
    let mapping = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG);
    if (mapping) map_pdf2actor = eval(`(${mapping})`);
    mapping = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ITEM_CONFIG);
    if (mapping) map_pdf2item = eval(`(${mapping})`);

    const systemfile = `/systems/${game.system.id}.mjs`;
    if (!map_pdf2actor) {
        await import(`..${systemfile}`)
            .then(module => {
                map_pdf2actor = module.actormap;
                map_pdf2item  = module.itemmap;
                game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, Obj2String(map_pdf2actor));
                game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ITEM_CONFIG,  Obj2String(map_pdf2item));
            })
            .catch(error => null)  // Don't worry if the file can't be laoded
    }
    if (!map_pdf2actor) map_pdf2actor = {};
    if (!map_pdf2item)  map_pdf2item  = {};

    // Wait for the IFRAME to appear in the window before any further initialisation (html = iframe)
    html.on('load', async (event) => {
        //console.debug(`${PDFCONFIG.MODULE_NAME}: PDF frame loaded for '${sheet.object.name}'`);
        let editable = document.canUserModify(game.user, "update");

        // Wait for the PDFViewer to be fully initialized
        const contentWindow = event.target.contentWindow;
        // Keep DOCUMENT->container mapping only while the window is open
        contentWindow.addEventListener('unload', (event) => {
            document2pdfviewer.delete(document.uuid);
        })

        // Wait for PDF to initialise before attaching to event bus.
        const pdfviewerapp = contentWindow.PDFViewerApplication;
        await pdfviewerapp.initializedPromise;

        // Wait for the AnnotationLayer to get drawn before populating all the fields with data from the Document.
        // TODO - how to only do these ONCE for each page (or ONCE for the whole document).
        //        Resizing the window causes this to be called again for each page!
        pdfviewerapp.eventBus.on('annotationlayerrendered', layerevent => {   // from PdfPageView

            console.log(`Loaded page ${layerevent.pageNumber} for ${document.name}`);
            let pdfpageview = layerevent.source;
            if (!document2pdfviewer.has(document.uuid)) document2pdfviewer.set(document.uuid, pdfviewerapp.pdfViewer);
            let options = {};
            if (!editable) options.disabled=true;
            if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.HIDE_EDITABLE_BG)) options.hidebg = true;

            if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.READ_FIELDS_FROM_PDF))
                setDocumentFromForm(pdfviewerapp.pdfViewer, document);
            else
                setFormFromDocument(pdfviewerapp.pdfViewer, document, options);
            
            // Some documents do NOT generate events that are captured by 'dispatcheventinsandbox',
            // so we need to attach here too.
            if (editable) {        
                // Only the inputs on this page, rather than the entire form.
                const inputs = pdfpageview.div.querySelectorAll('input,select,textarea');
                for (const element of inputs) {
                    // disabled fields are presumably automatically calculated values, so don't listen for changes to them.
                    if (!element.disabled && !element.getAttribute('pdfpager')) {
                        element.setAttribute('pdfpager', id_to_display);

                        if (element.type === 'checkbox') {
                            element.addEventListener('click', event => {
                                let target = event.target;
                                console.debug(`${event.type}: field='${target.name}', value = '${target.checked}'`);
                                modifyDocument(document, target.name, target.checked);    
                            })
                        } else if (element.type === 'radio') {
                            // If this element has the ":before" computed style, then this option is enabled
                            element.addEventListener('click', async event => {
                                let target = event.target;
                                let annotations = await pdfpageview.annotationLayer.pdfPage.getAnnotations();
                                let field = annotations.find(annotation => annotation.id == target.id);
                                let newvalue = field ? field.buttonValue : target.id;
                                console.debug(`${event.type}: field='${target.name}', value = '${newvalue}'`);
                                modifyDocument(document, target.name, newvalue);    
                            })
                        } else if (element.nodeName === 'SELECT') {
                            // select fields need to trigger as soon as a new selection is made
                            element.addEventListener('change', event => {
                                let target = event.target;
                                console.debug(`${event.type}: field='${target.name}', value = '${target.value}'`);
                                modifyDocument(document, target.name, target.value);    
                            })
                        } else {
                            // blur = lose focus
                            // submit = press RETURN
                            element.addEventListener('blur', event => {
                                let target = event.target;
                                console.debug(`${event.type}: field='${target.name}', value = '${target.value}'`);
                                modifyDocument(document, target.name, target.value);    
                            });
                            element.addEventListener('submit', event => {
                                let target = event.target;
                                console.debug(`${event.type}: field='${target.name}', value = '${target.value}'`);
                                modifyDocument(document, target.name, target.value);    
                            })
                        }
                    }
                }
            }
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