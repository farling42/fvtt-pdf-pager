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

const NO_FIELD_SET = "--------";
const OBJECT_FIELD = "\u1d453 accessors";

/**
 * Given the form for a window, return the PDFViewer embedded within the window
 * @param {html} htmlform The form for the window which contains a PDFViewer.
 * @returns the PDFViewer for the PDF embedded inside the window (or undefined if no PDF is found)
 */
export function getPdfViewer(htmlform) {
    return htmlform.getElementsByTagName('iframe')?.[0].contentWindow?.PDFViewerApplication?.pdfViewer;
}


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
            for (const annotation of annotations.filter(an => an.subtype === 'Widget'))
                if (annotation.buttonValue) buttonvalues.set(annotation.id, annotation.buttonValue);
        }
    }
    return buttonvalues;
}


/**
 * Copy all the data from the specified Document (Actor/Item) to the fields on the PDF sheet (container)
 * @param {PDFViewer} pdfviewer  
 * @param {Document} document An Actor or Item
 * @param {Object} options  Can contain any of { disabled : true , hidebg : true, hideborder: true, nospellcheck: false }
 */
async function setFormFromDocument(pdfviewer, document, options={}) {
    console.debug(`Loading PDF from ${document.documentName} '${document.name}'`);
    let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT) || {}
    let buttonvalues;  // support for radio buttons

    // Set values from the module FLAG on the Document.
    const inputs = pdfviewer.viewer.querySelectorAll('input,select,textarea');
    const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
    const edit_field_mappings = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.FIELD_MAPPING_MODE);

    //const storage = pdfpageview.annotationLayer.annotationStorage;
    for (let elem of inputs) {
        if (options.hidebg)     elem.style.setProperty('background-image', 'none');
        if (options.nospellcheck) elem.setAttribute('spellcheck', 'false');
        if (options.hideborder) elem.parentElement.style.setProperty('border-style', 'none');
        if (options.disabled)   elem.readOnly = true;

        // don't modify disabled (readonly) fields
        if (elem.disabled) continue; // DISABLED

        // Get required value, either from the FLAGS or from a field on the Actor
        let docfield = mapping && (mapping[elem.name]);
        if (edit_field_mappings && elem.nodeName == 'SELECT') {
            elem.value = (typeof docfield === 'string') ? docfield : NO_FIELD_SET;
            continue;
        }

        if (!docfield && getProperty(document, elem.name) !== undefined) docfield = elem.name;
        
        let value;
        if (!docfield) {
            value = getProperty(flags, elem.name);
        } else {
            if (docfield instanceof Object && docfield.getValue) {
                value = await docfield.getValue(document);
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
        } else if (elem.type === 'radio') {
            if (!buttonvalues) buttonvalues = await getbuttonvalues(pdfviewer);
            let field = buttonvalues.get(elem.id);
            let newvalue = (field === undefined) ? elem.id : field;

            let newchecked = (value == newvalue);
            if (elem.checked == newchecked) continue;
            elem.checked  = newchecked;
        } else {
            // plain text "type==textarea" OR rich text (type===?)
            let newvalue = value || "";
            if (elem.value === newvalue) continue;
            //if (newvalue.includes("<") && newvalue.includes(">"))
            //    newvalue = TextEditor.decodeHTML(TextEditor.enrichHTML(value, {async:false})).replace( /(<([^>]+)>)/ig, '');
            elem.value = newvalue;
        }
        // Force any calculations that might be set in the PDF
        elem.dispatchEvent(new KeyboardEvent("keydown", {key: 'Tab'}));   // Escape | Enter | Tab
    }
}


async function setDocumentFromForm(pdfviewer, document, options) {
    console.debug(`Setting ${document.documentName} '${document.name}' from PDF fields`);
    const inputs = pdfviewer.viewer.querySelectorAll('input,select,textarea');
    let buttonvalues; // support for radio buttons

    for (const element of inputs) {
        // Hide the background, if required
        if (options.hidebg) element.style.setProperty('background-image', 'none');
        if (options.nospellcheck) element.setAttribute('spellcheck', 'false');
        if (options.hideborder) element.parentElement.style.setProperty('border-style', 'none');

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
    const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;

    // If in edit mode, then modify the mapping
    if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.FIELD_MAPPING_MODE)) {
        // Update the local mapping
        mapping[fieldname] = (value === NO_FIELD_SET) ? undefined : value;
        if (document instanceof Actor)
            game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, map_pdf2actor);
        else
            game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ITEM_CONFIG, map_pdf2item);
        return;
    }

    const docfield = mapping?.[fieldname];
    if (!docfield && getProperty(document, fieldname) !== undefined) docfield = fieldname;

    if (!docfield) {
        // Copy the modified field to the MODULE FLAG in the Document
        let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT);
        if (!(flags instanceof Object)) flags = {};
        if (getProperty(flags, fieldname) === value) return;
        console.debug(`Hiding value '${document.name}'['${fieldname}'] = '${value}'`);
        setProperty(flags, fieldname, value);
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
    if (document?.sheet.rendered && document.sheet.constructor.name === "PDFActorSheet") {
        const pdfviewer = getPdfViewer(document.sheet.form);
        if (pdfviewer && !game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.READ_FIELDS_FROM_PDF))
            setFormFromDocument(pdfviewer, document);
    }
}
Hooks.on('updateActor', update_document)
Hooks.on('updateItem',  update_document)

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
        console.debug(`PDF frame loaded for '${document.name}'`);
        let read_pdf = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.READ_FIELDS_FROM_PDF);
        let editable = !read_pdf && document.canUserModify(game.user, "update");

        // Wait for the PDFViewer to be fully initialized
        const contentWindow = event.target.contentWindow;

        // Wait for PDF to initialise before attaching to event bus.
        const pdfviewerapp = contentWindow.PDFViewerApplication;
        await pdfviewerapp.initializedPromise;

        // Hide the toolbar (but we need to reclaim the space)
        if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.HIDE_TOOLBAR)) {
            pdfviewerapp.appConfig.appContainer.querySelector("div.toolbar").style.display="none";
            pdfviewerapp.appConfig.appContainer.querySelector("#viewerContainer").style.top = "0px";
        }

        let timeout=false;

        // Wait for the AnnotationLayer to get drawn before populating all the fields with data from the Document.
        // TODO - how to only do these ONCE for each page (or ONCE for the whole document).
        //        Resizing the window causes this to be called again for each page!
        pdfviewerapp.eventBus.on('annotationlayerrendered', async layerevent => {   // from PdfPageView

            console.debug(`Loaded page ${layerevent.pageNumber} for '${document.name}'`);
            let options = {};
            if (!editable) options.disabled=true;
            if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.HIDE_EDITABLE_BG)) options.hidebg = true;
            if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.HIDE_EDITABLE_BORDER)) options.hideborder = true;
            if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.NO_SPELL_CHECK)) options.nospellcheck = true;

            // Wait until the scripting engine is ready before doing either setDocumentFromForm or setFormFromDocument
            if (timeout) {
                console.debug(`pdf-pager: disabling previous load timeout`);
                clearTimeout(timeout);
                timeout=undefined;
            }
            function load() {
                timeout=undefined;
                let pdfviewer = pdfviewerapp.pdfViewer;
                if (!pdfviewerapp.scriptingReady) {
                    // Defer a short while until ready flag is set
                    timeout=setTimeout(load, 100);
                } else {
                    // Scripting engine is ready (or not available), so do the thing now
                    if (read_pdf)
                        setDocumentFromForm(pdfviewer, document, options);
                    else
                        setFormFromDocument(pdfviewer, document, options)
                }
            }
            load();

            // A list of all the fields in the PDF document
            //let fields = pdfviewerapp.pdfDocument.getFieldObjects();

            function setValue(event, fieldname="value", value=undefined) {
                let target = event.target;
                if (value==undefined) {
                    value = target[fieldname] ?? target.getAttribute(fieldname);
                }
                console.debug(`${event.type}: field='${target.name}', value = '${value}'`);
                modifyDocument(document, target.name, value);    
            }

            // Register listeners to all the editable fields
            if (editable) {        
                // Only the inputs on this page, rather than the entire form.
                const editor_menus = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.FIELD_MAPPING_MODE);
                const map_tooltips = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.SHOW_MAP_TOOLTIPS);
                let field_mappings, doc_type, objkeys;
                let pdfpageview = layerevent.source;
                let annotations = await pdfpageview.annotationLayer.pdfPage.getAnnotations();

                for (const element of pdfpageview.div.querySelectorAll('input,select,textarea')) {
                    // disabled fields are presumably automatically calculated values, so don't listen for changes to them.
                    if (!element.disabled && !element.getAttribute('pdfpager')) {
                        // Prevent adding listeners more than once
                        element.setAttribute('pdfpager', id_to_display);

                        if (element.type === 'checkbox') {
                            element.addEventListener('click', event => setValue(event,"checked"));
                        } else if (element.type === 'radio') {
                            // If this element has the ":before" computed style, then this option is enabled
                            element.setAttribute('pdfradiovalue', annotations.find(annot => annot.id == element.id)?.buttonValue ?? element.id);
                            element.addEventListener('click', event => setValue(event,'pdfradiovalue'));
                        } else if (element.nodeName === 'SELECT') {
                            // select fields need to trigger as soon as a new selection is made
                            element.addEventListener('change', setValue);
                        } else {
                            // blur = lose focus
                            element.addEventListener('blur',   setValue);
                            // If there is extra validation, the 'blur' event returns the OLD value!
                            // so we also have to wait for new value from sandbox (but updatefromsandbox fires on every character change)
                            element.addEventListener('updatefromsandbox', (event) => {
                                if (event.detail.formattedValue)
                                    setValue(event, "value", event.detail.formattedValue)
                                });
                            // submit = press RETURN
                            element.addEventListener('submit', setValue);
                        }

                        // Maybe show mapping tooltip
                        if (map_tooltips) {
                            if (!field_mappings) field_mappings = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
                            if (!doc_type) doc_type = (document instanceof Actor) ? "Actor" : "Item";
                            let extra = "";
                            const docfield = field_mappings?.[element.name];
                            if (docfield) {
                                extra += ` \u2192 ${doc_type}(`;
                                if (typeof docfield === 'string')
                                    extra += `${docfield}`;
                                else if (docfield.setValue)
                                    extra += `getter/setter functions`;
                                else
                                    extra += `getter function (no setter)`;
                                extra += ")";
                            }
                            element.setAttribute('title', `PDF(${element.name})${extra}`);
                        }

                        if (editor_menus) {
                            if (!field_mappings) field_mappings = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
                            if (!objkeys) {
                                const flatdoc = flattenObject(document);
                                objkeys = [];
                                for (const fieldname of Object.keys(flatdoc)) {
                                    if (fieldname.startsWith(`flags.${PDFCONFIG.MODULE_NAME}`)) continue;
                                    let type = typeof flatdoc[fieldname];
                                    if (["string","number","boolean"].includes(type)) {
                                        objkeys.push(fieldname);
                                    }
                                }
                            }

                            const elemdocument = element.ownerDocument;

                            const select = elemdocument.createElement("select");
                            select.name  = element.name;
                            select.id    = element.id;
                            select.addEventListener("change", (event) => {
                                const select = event.target;
                                const pdffield = select.name;
                                const docfield = select.value;
                                console.debug(`Changing mapping of ${pdffield} to ${docfield}`);

                                const mapping = (document instanceof Actor) ? map_pdf2actor : map_pdf2item;
                                if (typeof mapping[pdffield] === 'object') {
                                    console.debug(`Mapping contains an object (most likely getter/setter functions) - not modifying mapping`)
                                    return;
                                }
                                // Update the local mapping
                                mapping[pdffield] = (docfield === NO_FIELD_SET) ? undefined : docfield;
                                // Update the saved mapping
                                if (document instanceof Actor)
                                    game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ACTOR_CONFIG, map_pdf2actor);
                                else
                                    game.settings.set(PDFCONFIG.MODULE_NAME, PDFCONFIG.ITEM_CONFIG, map_pdf2item);
                            })

                            if (typeof field_mappings[element.name] === 'object') {
                                select.setAttribute("title", `PDF(${element.name}) - uses getter/setter functions`);
                                select.disabled = true;
                            } else {
                                select.setAttribute("title", `PDF(${element.name})`);
                                // First Option = default (no field selected)
                                const option2 = elemdocument.createElement('option');
                                option2.text  = NO_FIELD_SET;
                                option2.value = NO_FIELD_SET;
                                select.add(option2);

                                // Subsequent options = fields from Actor/Item
                                for (const fieldname of objkeys) {
                                    const option = elemdocument.createElement('option');
                                    option.value = fieldname;
                                    option.text  = fieldname;                                
                                    select.add(option);
                                }
                                const docfield = field_mappings?.[element.name];
                                select.value = (typeof docfield === 'string') ? docfield : NO_FIELD_SET;
                            }

                            // Replace the old type of element with the new select statement
                            element.parentElement.classList.add("choiceWidgetAnnotation");
                            element.replaceWith(select);
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

/**
 * 
 * @param {Document} document   e.g. an Actor
 * @param {String}   fieldname The name of the PDF field whose value is being change.
 * @param {String}   value     The value to store in the field.
 */
export function setPDFValue(document, fieldname, value) {
    let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT) || {}
    setProperty(flags, fieldname, value);
    document.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT, flags);
}

/**
 * 
 * @param {Document} document   The Actor whose data is being read.
 * @param {String}   fieldname The name of the field whose value is required.
 * @returns The value of the named PDF field (or undefined).
 */
export function getPDFValue(document, fieldname) {
    let flags = document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT) || {}
    return getProperty(flags, fieldname);
}

/**
 * Dumps to the console the name of all the editable fields in the PDF currently being displayed by the provided pdfviewer.
 * @param {PDFViewer} pdfviewer The viewer for the PDF whose fields are to be dumped to the console.
 */
export async function logPdfFields(pdfviewer) {
    console.log(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.logPdfFields.introduction`));
    for (const pdfpageview of pdfviewer._pages) {
        let annotations = await pdfpageview.pdfPage?.getAnnotations();
        if (annotations) {
            console.log(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.logPdfFields.pageNumber`, {pageNumber: pdfpageview.pdfPage.pageNumber}))
            for (const annotation of annotations.filter(an => an.subtype === 'Widget'))
                console.log(`${annotation.fieldName} (${annotation.fieldType})`);
        }
    }
}

