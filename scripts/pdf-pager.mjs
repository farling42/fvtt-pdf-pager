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

import { PDFCONFIG, ScrollMode, SpreadMode, SpreadChoices } from './pdf-config.mjs';
import { initEditor } from './pdf-editable.mjs';
import { getPDFByCode, getPDFByName } from './pdf-linker.mjs';
import { setupAnnotations } from './pdf-annotations.mjs';

/**
 * @UUID{JournalEntry.T29aMDmLCPYybApI.JournalEntryPage.iYV6uMnFwdgZORxi#page=10}
 * 
 * puts data-hash attribute onto <a> class:
 *    <a class="content-link" draggable="true" data-hash="page=10" data-uuid="JournalEntry.T29aMDmLCPYybApI" data-id="T29aMDmLCPYybApI" data-type="JournalEntry" data-tooltip="Journal Entry"><i class="fas fa-book-open"></i>PDF</a>
 * 
 * In _onClickContentLink(event) we can access event.currentTarget.dataset.hash
 * sheet#render is passed (true, options {pageId, anchor: dataset.hash})
 * 
 * async JournalSheet.prototype._render(force,options)
 * calls renderPageViews
 * then looks for options.anchor and finds an entry in the toc
 */

Hooks.once('ready', async () => {
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.documents.JournalEntryPage.prototype._onClickDocumentLink', JournalEntryPage_onClickDocumentLink, libWrapper.MIXED);
    // APPv1
    //libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.appv1.sheets.JournalSheet.prototype.goToPage', JournalEntrySheet_goToPage, libWrapper.MIXED);
    //libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.appv1.sheets.JournalSheet.prototype._renderPageViews', JournalEntrySheet_renderPageViews, libWrapper.WRAPPER);
    //libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.appv1.sheets.JournalSheet.prototype._renderHeadings', JournalEntrySheet_renderHeadings, libWrapper.OVERRIDE);
    // APPv2
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.applications.sheets.journal.JournalEntrySheet.prototype.goToPage', JournalEntrySheet_goToPage, libWrapper.MIXED);
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.applications.sheets.journal.JournalEntrySheet.prototype._renderPageViews', JournalEntrySheet_renderPageViews, libWrapper.WRAPPER);
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'foundry.applications.sheets.journal.JournalEntrySheet.prototype._renderHeadings', JournalEntrySheet_renderHeadings, libWrapper.OVERRIDE);
});

class PDFSheet extends foundry.applications.sheets.journal.JournalEntryPagePDFSheet {
    /** @override */
    static DEFAULT_OPTIONS = {
        includeTOC: true
    };

    /** @inheritDoc */
    async _onRender(context, options) {
        await super._onRender(context, options);
        if (this.options.includeTOC) {
            const toc = this.toc[this.document.name.slugify()];
            if (toc) toc.children = JSON.parse(this.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC) ?? "{}");
        }
    }
}

Hooks.on("ready", () => {
    foundry.applications.apps.DocumentSheetConfig.registerSheet(foundry.documents.JournalEntryPage, "pdfpager", PDFSheet, {
        types: ["pdf"],
        makeDefault: true
    });
})

/**
 * Process a click on a link to this document.
 * 
 * Don't rerender the PDF page if we can switch the displayed PDF internally to the correct page.
 * @param {} wrapper 
 * @param {*} event 
 * @returns 
 */
function JournalEntryPage_onClickDocumentLink(wrapper, event) {
    let pdfsheet = getPdfSheet(this.parent.sheet, this.id);
    if (updatePdfView(pdfsheet, decodeURIComponent(event.currentTarget.getAttribute('data-hash')))) {
        // Cancel any previous stored anchor
        delete pdfsheet.document.pdfpager_anchor;
        return;
    } else
        return wrapper(event);
}

/**
 * Process a click in the TOC.
 */
function JournalEntrySheet_goToPage(wrapper, pageId, anchor) {
    let pdfsheet = getPdfSheet(this, pageId);
    if (pdfsheet && anchor) {
        if (anchor.anchor) anchor = anchor.anchor;
        if (updatePdfView(pdfsheet, anchor)) {
            // Moved within existing page - so no need to invoke the normal goToPage processing that will render a new page.
            delete pdfsheet.document.pdfpager_anchor;
            return;
        }
        // switch to the relevant page with the relevant slug (after page gets rendered)
        pdfsheet.document.pdfpager_anchor = anchor;
    }
    return wrapper(pageId, anchor);
}


/**
 * 
 * @param {JournalPDFPageSheet|JournalEntryPagePDFSheet} pdfsheet The PDF sheet to be affected
 * @param {String} anchor A page number or a TOC section string
 * @returns true if the change was made
 */
function updatePdfView(pdfsheet, anchor) {
    const linkService = pdfsheet?.pdfviewerapp?.pdfLinkService;
    if (!linkService || !anchor || anchor === "null") return false;

    const dest = anchor.startsWith('page=') ?
        // Adjust page with configured PDF Page Offset
        `page=${+anchor.slice(5) + (pdfsheet.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET) ?? 0)}` :
        // Convert our internal link name into a PDF outline slug
        pdfsheet.toc[anchor].pdfslug;

    if (CONFIG.debug.pdfpager) console.debug(`updatePdfView(sheet='${pdfsheet.document.name}', anchor='${anchor}')\n=>'${dest}'`);
    linkService.setHash(dest);
    // Do the journal.sheet(false, {focus: true}) without re-rendering the app,
    // otherwise we lose the selected page.
    pdfsheet.document?.parent?.sheet?.bringToFront();
    return true;
}

/* Determine if the PDF page is visible in the supplied journal sheet */
export function getPdfSheet(journalsheet, pageId) {
    if (journalsheet?.state === Application.RENDER_STATES.RENDERED &&
        journalsheet.pageId === pageId) {
        let sheet = journalsheet.getPageSheet(pageId);
        if (sheet?.document?.type === 'pdf') return sheet;
    }
    return null;
}




/**
 * Convert PDF outline to Foundry TOC (see JournalEntryPage#buildTOC)
 * @param {PDFOutline} pdfoutline
 * @returns {Object<JournalEntryPageHeading>}
 */

function buildOutline(pdfoutline) {
    let root = { level: 0, children: [] };
    function iterate(outline, parent) {
        for (let outlineNode of outline) {
            // Create a JournalEntryPageHeading from the PDF node:
            // see Foundry: JournalEntryPage#_makeHeadingNode
            const tocNode = {
                text: outlineNode.title,
                level: parent.level + 1,
                slug: JournalEntryPage.slugifyHeading(outlineNode.title),
                children: [],
                // Our data below:
                pdfslug: JSON.stringify(outlineNode.dest),
                pdfanchor: `#${encodeURIComponent((typeof outlineNode.dest === "string") ? outlineNode.dest : JSON.stringify(outlineNode.dest))}`
            };
            parent.children.push(tocNode);
            // Add children after the parent
            if (outlineNode.items?.length) iterate(outlineNode.items, tocNode);
        }
    }
    iterate(pdfoutline, root);
    return JournalEntryPage._flattenTOC(root.children);
}

/**
 * Updates the TOC to show the item currently being viewed in the PDF.
 * 
 * @param {JournalPDFPageSheet|JournalEntryPagePDFSheet} pdfsheet 
 * @param {*} location 
 */
async function updateOutline(pdfsheet, location) {
    let outline = pdfsheet.pdfviewerapp.pdfOutlineViewer;

    // as per pdf.js: PDFOutlineViewer._currentOutlineItem()
    if (!outline._isPagesLoaded || !outline._outline || !outline._pdfDocument) {
        return;
    }
    const pageNumberToDestHash = await outline._getPageNumberToDestHash(outline._pdfDocument);
    if (!pageNumberToDestHash) {
        return;
    }
    const html = pdfsheet?.document?.parent?.sheet?.element[0];
    if (!html || !pdfsheet.toc) return;

    for (let i = outline._currentPageNumber; i > 0; i--) {
        const destHash = pageNumberToDestHash.get(i);
        if (!destHash) {
            continue;
        }
        // See if destHash is in our TOC
        let linkElement;
        for (const value of Object.values(pdfsheet.toc))
            if (value.pdfanchor === destHash) {
                linkElement = value;
                break;
            }
        if (!linkElement) {
            continue;
        }
        const tocitem = html.querySelector(`ol.headings li.heading[data-anchor="${linkElement.slug}"]`);
        if (!tocitem) {
            // The actual TOC entry is too deep to be displayed on the Journal sheet,
            // so we need to look for the earliest parent.
            // see JournalSheet_renderHeadings later.
            //console.log(`updateOutline: no tocitem for "${linkElement.slug}" to match "${destHash}"`)
            continue;
        }
        tocitem.scrollIntoView({ block: "center" });
        break;
    }
}

/**
 * 
 * @param {JournalPDFPageSheet|JournalEntryPagePDFShee} sheet 
 * @param {HTMLElement} html 
 * @returns 
 */
function isConfiguringPage(sheet, html) {
    return html.querySelector('file-picker[name="src"]');
}

/**
 * Adds the "Page Offset" field to the JournalPDFPageSheet EDITOR window.
 * @param {*} wrapper from libWrapper
 * @param  {sheetData} args an array of 1 element, the first element being the same as the data passed to the render function
 * @returns {jQuery} html
 */
function handle_pdf_sheet(html, pdfsheet) {
    const pagedoc = pdfsheet.document;  // JournalEntryPage

    // Ensure we have a TOC on this sheet.
    // Emulate TextPageSheet._renderInner setting up the TOC
    let toc = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
    if (toc)
        pdfsheet.toc = JSON.parse(toc);
    else
        delete pdfsheet.toc;

    if (isConfiguringPage(pdfsheet, html)) {
        // Editting, so add our own elements to the window
        const flags = new foundry.data.fields.ObjectField({ label: "module-flags" }, { parent: pagedoc.schema.fields.flags, name: PDFCONFIG.MODULE_NAME });

        const elem_offset = (new foundry.data.fields.NumberField(
            {
                label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.PageOffset.Label`),
                initial: pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET) ?? ""
            },
            { parent: flags, name: PDFCONFIG.FLAG_OFFSET })).toFormGroup();

        const elem_code = (new foundry.data.fields.StringField(
            {
                label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Code.Label`),
                initial: pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE) ?? ""
            },
            { parent: flags, name: PDFCONFIG.FLAG_CODE })).toFormGroup();

        const elem_spread = (new foundry.data.fields.NumberField(
            {
                label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.defaultSpread.Name`),
                initial: pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_SPREAD) ?? SpreadMode.UNKNOWN,
                choices: SpreadChoices
            },
            { parent: flags, name: PDFCONFIG.FLAG_SPREAD })).toFormGroup();

        const otherfield = html.querySelector('div.form-group div.form-fields').parentElement.parentElement;
        otherfield.appendChild(elem_offset);
        otherfield.appendChild(elem_code);
        otherfield.appendChild(elem_spread);

        html.querySelector(`input[name="flags.${PDFCONFIG.MODULE_NAME}.${PDFCONFIG.FLAG_CODE}"]`).addEventListener('drop', function (event) {
            event.preventDefault();
            event.stopPropagation();
            // TextEditor.getDragEventData requires event.dataTransfer to exist.
            const data = TextEditor.getDragEventData(event);
            console.log(`Dropped onto pagecode: ${data}`)
            if (!data) return;
            if (data.type === 'Actor' || data.type === 'Item') event.currentTarget.value = data.uuid;
        })

        // Ensure window is resized to account for the additional buttons
        pdfsheet.setPosition({height: "auto"});

    } else {

        // Not editting, so maybe replace button with actual PDF
        let anchor = pagedoc.pdfpager_anchor;
        if (anchor || game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ALWAYS_LOAD_PDF)) {
            let rawlink = false;
            let pdf_slug = "";
            if (typeof anchor === 'number')
                pdf_slug = `#page=${anchor + (pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET) ?? 0)}`;
            else if (typeof anchor === 'string' && pdfsheet.toc) {
                // convert TOC entry to PDFSLUG.
                // if the final slug is a string then it is an entry in the PDF's destination table.
                // if the final slug is an ARRAY, then we can't pass it as a parameter to viewer.html.
                let docslug = pdfsheet.toc[anchor]?.pdfslug;
                let slug = docslug && JSON.parse(docslug);
                if (typeof slug === 'string')
                    pdf_slug = `#nameddest=${slug}`;
                else if (slug) {
                    // Pass array directly
                    pdf_slug = `#${docslug}`;
                    rawlink = true;
                }
                // In all likelihood the outline's array is likely to have an explicit zoom value anyway.
            }
            // If we are using a raw bookmark (rather than a named bookmark), then don't allow other parameters on the line
            if (!rawlink) {
                // Add configured zoom
                let default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM);
                if (default_zoom && default_zoom !== 'none') {
                    console.log(`displaying PDF with default zoom of ${default_zoom}%`);
                    if (default_zoom === 'number') default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM_NUMBER)
                    pdf_slug += (pdf_slug.length ? "&" : "#") + `zoom=${default_zoom}`;
                }
            }

            // as JournalPagePDFSheet#_onLoadPDF, but adding optional page-number
            const iframe = document.createElement("iframe");
            iframe.src = `modules/pdf-pager/libs/pdfjs/web/viewer.html?${pdfsheet._getViewerParams()}${pdf_slug}`;
            if (CONFIG.debug.pdfpager) console.debug(iframe.src);

            if (html instanceof jQuery) {
                // Replace entry in jQuery array
                let found;
                for (let i = 0; i < html.length; i++)
                    if (html[i].className == 'load-pdf') {
                        html[i] = iframe;
                        found = true;
                        break;
                    }
                if (!found) return html;
            } else {
                // Replace button in actual HTML tree
                const button = html.querySelector('div.load-pdf');
                if (!button) return html;
                button.replaceWith(iframe);
            }
        }
    }

    // Register handler to generate the TOC after the PDF has been loaded.
    // (This is done in the editor too, so that the flag can be set as soon as a PDF is selected)
    async function loadiframe(event) {
        if (CONFIG.debug.pdfpager) console.debug(`PDF frame loaded for '${pagedoc.name}'`);

        // Wait for PDF to initialise before attaching to event bus.
        pdfsheet.pdfviewerapp = event.target.contentWindow.PDFViewerApplication;
        await pdfsheet.pdfviewerapp.initializedPromise;

        // pdfviewerapp.pdfDocument isn't defined at this point
        // Read the outline and generate a TOC object from it.
        if (pagedoc.permission == CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            pdfsheet.pdfviewerapp.eventBus.on('outlineloaded', docevent => {   // from PdfPageView
                pdfsheet.pdfviewerapp.pdfDocument.getOutline().then(outline => {
                    // Store it as JournalPDFPageSheet.toc
                    const oldflag = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
                    if (outline) {
                        let newflag = JSON.stringify(buildOutline(outline));
                        if (oldflag !== newflag) {
                            if (CONFIG.debug.pdfpager) console.debug(`Storing new TOC for '${pagedoc.name}'`)
                            pagedoc.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC, newflag)
                            pdfsheet._toc = outline;
                        }
                    } else if (oldflag !== undefined) {
                        pagedoc.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
                    }
                })
            })
        }

        // Need to wait for "documentinit" event, otherwise the default options from the Viewer are loaded.
        pdfsheet.pdfviewerapp.eventBus.on("documentinit", event => {

            let value = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_SCROLL);
            if (value !== ScrollMode.UNKNOWN) pdfsheet.pdfviewerapp.pdfViewer.scrollMode = Number(value);

            // Set spread mode (might be String or Number)
            value = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_SPREAD) ?? SpreadMode.UNKNOWN;
            if (value == SpreadMode.UNKNOWN) value = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_SPREAD);
            if (CONFIG.debug.pdfpager) console.log(`existing spread mode = ${pdfsheet.pdfviewerapp.pdfViewer.spreadMode}`);
            if (value != SpreadMode.UNKNOWN) pdfsheet.pdfviewerapp.pdfViewer.spreadMode = Number(value);
            if (CONFIG.debug.pdfpager) console.log(`new spread mode = ${pdfsheet.pdfviewerapp.pdfViewer.spreadMode}`);
        })

        // Keep the TOC inline with the current visible page
        if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.AUTO_SCROLL_TOC)) {
            pdfsheet.pdfviewerapp.eventBus.on("updateviewarea", location => {
                if (!pdfsheet.pdfviewerapp.pdfOutlineViewer._isPagesLoaded) return;
                updateOutline(pdfsheet, location);
            })
        }
    };
    html.querySelector("iframe")?.addEventListener('load', loadiframe);

    return html;
}

Hooks.on("renderJournalEntryPagePDFSheet", (sheet, html, data) => {
    handle_pdf_sheet(html, sheet);

    // Ignore if it is the PDF Page Editor which is being displayed.
    if (isConfiguringPage(sheet, html)) return;

    // Initialising the editor MUST be done after the button has been replaced by the IFRAME.
    const docid = data.document.pdfpager_show_uuid ?? data.document.uuid;
    if (game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.FORM_FILL_PDF))
        initEditor(html, docid);
    else
        setupAnnotations(html, docid);
});

// Remove the flags we saved on the PAGE when the displayed window is closed.

Hooks.on("closeJournalEntrySheet", (sheet) => {
    if (CONFIG.debug.pdfpager) console.log(`closing Journal '${sheet.document.name}'`)
    for (const pageid in sheet._pages) {
        const page = sheet.getPageSheet(pageid)?.document;
        if (page?.type === 'pdf') {
            if (CONFIG.debug.pdfpager) console.log(`cleaning PDF page '${page.name}'`)
            delete page.pdfpager_anchor;
            delete page.pdfpager_show_uuid;
        }
    }
})

Hooks.on("closeViewJournalEntryPagePDFSheet", (sheet) => {
    if (CONFIG.debug.pdfpager) console.log(`cleaning PDF page '${sheet.document.name}'`)
    let page = sheet.document;
    delete page.pdfpager_anchor;
    delete page.pdfpager_show_uuid;
})

/**
 * An exact copy of JournalEntrySheet#_renderHeading from foundry.js,
 * with the only change to set MAX_NESTING depending on whether the page is a PDF or not.
 */



async function JournalEntrySheet_renderHeadings(pageNode, toc) {
    const pageId = pageNode.dataset.pageId;
    const page = this.entry.pages.get(pageId);
    const MAX_NESTING = (page.type == 'pdf') ? game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.MAX_TOC_DEPTH) : 2;
    const tocNode = this.element.querySelector(`.toc [data-page-id="${pageId}"]`);
    if (!tocNode || !toc) return;
    let headings = Object.values(toc);
    headings.sort((a, b) => a.order - b.order);
    if (page.title.show) headings.shift();
    const minLevel = Math.min(...headings.map(node => node.level));
    tocNode.querySelector(":scope > ol")?.remove();
    headings = headings.reduce((arr, { text, level, slug, element }) => {
        if (element) element.dataset.anchor = slug;
        if (level < minLevel + MAX_NESTING) arr.push({ text, slug, level: level - minLevel + 2 });
        return arr;
    }, []);
    const html = await foundry.applications.handlebars.renderTemplate("templates/journal/toc.hbs", { headings });
    tocNode.insertAdjacentHTML("beforeend", html);
}



/**
 * my_journal_render reads the page=xxx anchor from the original link, and stores it temporarily for use by renderJournalPDFPageSheet later
 * Wraps JournalSheet#_render
 */
let webviewerloaded_set = false;

function JournalEntrySheet_renderPageViews(wrapper, context, options) {

    if (!options.anchor && !options.showUuid) return wrapper(context, options);

    let pagedoc;
    for (const id of options.parts) {
        if (!(id in this._pages)) continue;
        pagedoc = this.document.pages.get(id);
        if (pagedoc) pagedoc.pdfpager_anchor = +options.anchor.slice(5);
    }
    if (!pagedoc || pagedoc.type !== 'pdf') return wrapper(context, options);

    if (!webviewerloaded_set) {
        // Add to the window only ONCE!
        // Even though it is triggered for every PDF page load.
        webviewerloaded_set = true;

        window.document.addEventListener("webviewerloaded", event => {
            //console.log("webviewerloaded", event, source);
            const source = event.detail.source;

            const always_ignore = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.IGNORE_BOOKMARK_ZOOM);
            const default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM);
            const ignore = always_ignore || (default_zoom && default_zoom !== 'none');

            if (CONFIG.debug.pdfpager) console.debug(`Setting ignoreDestinationZoom=${ignore}`);
            source.PDFViewerApplicationOptions.set("disablePreferences", true);
            source.PDFViewerApplicationOptions.set("ignoreDestinationZoom", ignore);
        });
    }


    if (options.anchor) {
        console.log(`render: ${JSON.stringify(options)}`)
        pagedoc.pdfpager_anchor = options.anchor?.startsWith('page=') ? +options.anchor.slice(5) : decodeURIComponent(options.anchor);
        delete options.anchor;
    }
    if (options.showUuid) {
        console.log(`rendering for Document '${options.showUuid}'`)
        page.pdfpager_show_uuid = options.showUuid;
        delete options.showUuid;
    }
    return wrapper(context, options);
}


function openPDF(pagedoc, options) {
    const journalsheet = pagedoc.parent.sheet;
    // Render journal entry showing the appropriate page (JournalEntryPage#_onClickDocumentLink)
    if (!options?.uuid && options.page &&
        journalsheet?._state === Application.RENDER_STATES.RENDERED &&
        journalsheet._pages[journalsheet.pageIndex]?._id === pagedoc.id &&
        updatePdfView(journalsheet.getPageSheet(pagedoc.id), `page=${options.page}`)) {
        // We updated the already displayed PDF document
        return;
    } else {
        // updatePdfView didn't do the work, so do it here instead.
        let pageoptions = { pageId: pagedoc.id };
        if (options?.page) pageoptions.anchor = `page=${options.page}`;
        if (options?.uuid) pageoptions.showUuid = options.uuid;
        pagedoc.parent.sheet.render(true, pageoptions);
    }
}

/**
 * 
 * @param {*} pdfcode The short code of the PDF page to be displayed
 * @param {*} options Can include {page: <number>}  and/or { pdfcode: <code> } and/or { showUuid : <docid> }
 */
export function openPDFByCode(pdfcode, options = {}) {
    console.log(`openPDFByCode('${pdfcode}', '${JSON.stringify(options)}')`);

    const pagedoc = getPDFByCode(pdfcode);
    // Stop now if no page was found
    if (pagedoc)
        openPDF(pagedoc, options);
    else {
        console.error(`openPdfByCode: unable to find PDF with code '${pdfcode}'`)
        ui.notifications.error(game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Error.NoPDFWithCode`))
    }
}


/**
 * 
 * @param {String} pdfname The name that would appear in a `@PDF[pdfname]` link
 */
export function openPDFByName(pdfname, options = {}) {
    console.log(`openPDFByName('${pdfname}', '${JSON.stringify(options)}')`);

    const pagedoc = getPDFByName(pdfname);
    if (pagedoc)
        openPDF(pagedoc, options)
    else
        return openPDFByCode(pdfname, options);
}


export function deleteOutlines() {
    if (!game.user.isGM) {
        ui.notifications.warn(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.Warning.OnlyGM`, { function: "deleteOutlines()" }));
        return;
    }
    for (const journal of game.journal) {
        for (const page of journal.pages) {
            if (page.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC)) {
                console.log(`Removed stored Outline for '${page.name}' in '${journal.name}'`)
                page.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
                if (page._toc) page._toc = null;
            }
        }
    }
}