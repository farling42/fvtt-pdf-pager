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

import { PDFCONFIG } from './pdf-config.mjs';
import { initEditor } from './pdf-editable.mjs';
import { migratePDFoundry } from './pdf-migrate.mjs';

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
    // Need to capture the PDF page number
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'JournalPDFPageSheet.prototype._renderInner',      JournalPDFPageSheet_renderInner,      libWrapper.WRAPPER);
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'JournalEntryPage.prototype._onClickDocumentLink', JournalEntryPage_onClickDocumentLink, libWrapper.MIXED);
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'JournalSheet.prototype._render',     JournalSheet_render,  libWrapper.WRAPPER);
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'JournalSheet.prototype.goToPage',    JournalSheet_goToPage, libWrapper.MIXED);

    if (game.user.isGM) await migratePDFoundry({onlyIfEmpty:true});
});

// Ugly hack to get the PAGE number from the JournalSheet#render down to the JournalPDFPageSheet#render
// We store local variables on the JournalEntryPage
// page.pdfpager_anchor=undefined;      // page number (if number) or TOC anchor (if string)
// page.pdfpager_show_uuid=undefined;   // The UUID of the Actor/Item to be displayed in the PDF being opened


/**
 * 
 * @param {JournalPDFPageSheet} pdfsheet The PDF sheet to be affected
 * @param {String} anchor A page number or a TOC section string
 * @returns true if the change was made
 */
function updatePdfView(pdfsheet, anchor) {
    const linkService = pdfsheet?.pdfviewerapp?.pdfLinkService;
    if (!linkService || !anchor) return false;

    console.debug(`updatePdfView(sheet='${pdfsheet.object.name}', anchor='${anchor}')`);
    if (anchor.startsWith('page='))
        linkService.goToPage(+anchor.slice(5) + (pdfsheet.object.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET) ?? 0));
    else
        linkService.goToDestination(JSON.parse(pdfsheet.toc[anchor].pdfslug));
    return true;
}

/* Determine if the PDF page is visible in the supplied journal sheet */
function getPdfSheet(journalsheet, pageId) {
    if (journalsheet?._state === Application.RENDER_STATES.RENDERED &&
        journalsheet._pages[journalsheet.pageIndex]?._id === pageId) {
        let sheet = journalsheet.getPageSheet(pageId);
        if (sheet?.document?.type == 'pdf') return sheet;
    }
    return null;
}
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
    if (pdfsheet &&
        updatePdfView(pdfsheet, decodeURIComponent(event.currentTarget.getAttribute('data-hash')))) {
        // Cancel any previous stored anchor
        delete pdfsheet.document.pdfpager_anchor;
        return;
    } else
        return wrapper(event);
}

/**
 * Process a click in the TOC.
 */
function JournalSheet_goToPage(wrapper, pageId, anchor) {
    let pdfsheet = getPdfSheet(this, pageId);
    if (pdfsheet && anchor) {
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
 * Convert PDF outline to Foundry TOC (see JournalEntryPage#buildTOC)
 * @param {PDFOutline} pdfoutline
 * @returns {Object<JournalEntryPageHeading>}
 */

function buildOutline(pdfoutline) {
    let root = {level: 0, children: []};
    function iterate(outline, parent) {
        for (let outlineNode of outline) {
            // Create a JournalEntryPageHeading from the PDF node:
            // see Foundry: JournalEntryPage#_makeHeadingNode
            const tocNode = {
                text:  outlineNode.title,
                level: parent.level+1,
                slug:  JournalEntryPage.slugifyHeading(outlineNode.title),
                children: [],
                // Needed to avoid breaking Foundry code
                element: { dataset : { anchor: "" } },  // FOUNDRY does: element.dataset.anchor = slug;
                // Our data below:
                pdfslug:  JSON.stringify(outlineNode.dest)
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
 * Adds the "Page Offset" field to the JournalPDFPageSheet EDITOR window.
 * @param {*} wrapper from libWrapper
 * @param  {sheetData} args an array of 1 element, the first element being the same as the data passed to the render function
 * @returns {jQuery} html
 */
 async function JournalPDFPageSheet_renderInner(wrapper, sheetData) {
    let html = await wrapper(sheetData);   // jQuery
    const pagedoc = sheetData.document;

    // Ensure we have a TOC on this sheet.
    // Emulate TextPageSheet._renderInner setting up the TOC
    let toc = this.object.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
    if (toc) {
        this.toc = JSON.parse(toc);
        // Prevent error being reported by core Foundry when it tries to do:
        // this.getPageSheet(pageId)?.toc[options.anchor]?.element.scrollIntoView();
        for (let key in this.toc) {
            this.toc[key].element.scrollIntoView = empty_function;
        }
    }
    else   
        delete this.toc;

    if (this.isEditable) {
        // Editting, so add our own elements to the window
        const page_offset  = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET);
        const value_offset = page_offset ? ` value="${page_offset}"` : "";
        const label_offset = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.PageOffset.Label`);
        const elem_offset  = `<div class="form-group"><label>${label_offset}</label><input class="pageOffset" type="number" name="flags.${PDFCONFIG.MODULE_NAME}.${PDFCONFIG.FLAG_OFFSET}"${value_offset}/></div>`;

        const page_code   = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
        const value_code  = page_code ? ` value="${page_code}"` : "";
        const label_code  = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Code.Label`);
        const elem_code   = `<div class="form-group"><label>${label_code}</label><input class="pageCode" type="text" name="flags.${PDFCONFIG.MODULE_NAME}.${PDFCONFIG.FLAG_CODE}"${value_code}/></div>`;

        html.find('div.picker').after(elem_offset + elem_code);
        // Add hook to allow drop of Actor or Item into the 'PDF Code' field
        html.find('.pageCode').on('dragover', false).on('drop', function (event) {
            event.preventDefault();
            event.stopPropagation();
            // TextEditor.getDragEventData requires event.dataTransfer to exist.
            const data = TextEditor.getDragEventData(event.originalEvent);
            console.log(`Dropped onto pagecode: ${data}`)
            if (!data) return;
            if (data.type === 'Actor' || data.type === 'Item') this.value = data.uuid;
        })
    } else {
        // Not editting, so maybe replace button with actual PDF
        let anchor = pagedoc.pdfpager_anchor;
        if (anchor || game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ALWAYS_LOAD_PDF)) {
            // Immediately do JournalPagePDFSheet#_onLoadPDF
            const pdf_slug = 
                (typeof anchor === 'number') ?
                    `#page=${anchor + (pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET) ?? 0)}` :
                (typeof anchor === 'string' && this.toc) ?
                    `#${this.toc[anchor].pdfslug}` :   // convert TOC entry to PDFSLUG
                '';

            // Replace the "div.load-pdf" with an iframe element.
            // I can't find a way to do it properly, since html is simply a jQuery of top-level elements.
            //
            // Ideally it would simply involve html.closest('div.load-pdf').replaceWith(frame);

            let idx=-1;
            for (let i=0; i<html.length; i++)
                if (html[i].className == 'load-pdf') idx = i;
            if (idx==-1) return html;

            // as JournalPagePDFSheet#_onLoadPDF, but adding optional page-number
            const frame = document.createElement("iframe");
            frame.src = `scripts/pdfjs/web/viewer.html?${this._getViewerParams()}${pdf_slug}`;
            console.debug(frame.src);
            html[idx] = frame;
        }
    }

    // Register handler to generate the TOC after the PDF has been loaded.
    // (This is done in the editor too, so that the flag can be set as soon as a PDF is selected)
    html.on('load', async (event) => {
    //console.debug(`PDF frame loaded for '${document.name}'`);
        
        // Wait for PDF to initialise before attaching to event bus.
        this.pdfviewerapp = event.target.contentWindow.PDFViewerApplication;
        await this.pdfviewerapp.initializedPromise;

        // pdfviewerapp.pdfDocument isn't defined at this point    
        // Read the outline and generate a TOC object from it.
        if (this.object.permission == CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            this.pdfviewerapp.eventBus.on('outlineloaded', docevent => {   // from PdfPageView
                this.pdfviewerapp.pdfDocument.getOutline().then(outline => {
                    // Store it as JournalPDFPageSheet.toc
                    if (outline) {
                        let oldflag = this.object.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
                        let newflag = JSON.stringify(buildOutline(outline));
                        if (oldflag !== newflag) {
                            console.debug(`Storing new TOC for '${this.object.name}'`)
                            this.object.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC, newflag)
                        }
                    } else {
                            this.object.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
                    }
                })
            })
        }
    })
    
    return html;
}

function empty_function() {};

Hooks.on("renderJournalPDFPageSheet", function(sheet, html, data) {
    // Initialising the editor MUST be done after the button has been replaced by the IFRAME.
    if (!sheet.isEditable && game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.FORM_FILL_PDF)) {
        const uuid = data.document.pdfpager_show_uuid || sheet.object.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
        if (uuid) initEditor(html, uuid);
    }
})

// Remove the flags we saved on the PAGE when the displayed window is closed.

Hooks.on("closeJournalSheet", (sheet, element) => {
    console.log(`closing ${sheet.document.name}`)
    for (const node of sheet._pages) {
        if (node.type === 'pdf') {
            let page = sheet.getPageSheet(node._id)?.document;
            if (page) {
                delete page.pdfpager_anchor;
                delete page.pdfpager_show_uuid;
            }
        }
    }
})
Hooks.on("closeJournalPDFPageSheet", (sheet, element) => {
    console.log(`closing PDF ${sheet.document.name}`)
    let page = sheet.document;
    delete page.pdfpager_anchor;
    delete page.pdfpager_show_uuid;
})


/**
 * my_journal_render reads the page=xxx anchor from the original link, and stores it temporarily for use by renderJournalPDFPageSheet later
 * Wraps JournalSheet#_render
 */
function JournalSheet_render(wrapper,force,options) {
    // Monk's Active Tile Triggers sets the anchor to an array, so we need to check for a string here.
    let page  = this.object.pages.get(options.pageId);
    let ispdf = page?.type === 'pdf';
    if (!this.rendered && ispdf) {
        delete page.pdfpager_anchor;
        delete page.pdfpager_show_uuid;
    }
    if (options.anchor && 
        typeof options.anchor === 'string' &&
        ispdf) {
        console.log(`render: ${JSON.stringify(options)}`)
        page.pdfpager_anchor = options.anchor?.startsWith('page=') ? +options.anchor.slice(5) : decodeURIComponent(options.anchor);
        delete options.anchor;   // we don't want the wrapper trying to set the anchor
    }
    if (options.showUuid) {
        console.log(`rendering for Document '${options.showUuid}'`)
        page.pdfpager_show_uuid = options.showUuid;
        delete options.showUuid;
    }
    return wrapper(force,options);
}



let code_cache = new Map();

/**
 * 
 * @param {*} pdfcode The short code of the PDF page to be displayed
 * @param {*} options Can include {page: <number>}  and/or { pdfcode: <code> } and/or { showUuid : <docid> }
 */
 export function openPDFByCode(pdfcode, options={}) {
    console.log(`openPDFByCode('${pdfcode}', '${JSON.stringify(options)}'`);

    let pagedoc;
    // Check cache value is still valid
    let page_uuid = code_cache.get(pdfcode);
    if (page_uuid) {
        // We don't support Compendiums, so we can use fromUuidSync safely
        pagedoc = fromUuidSync(page_uuid);
        let code = pagedoc?.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
        if (code != pdfcode) {
            // CODE no longer matches, so remove from cache
            code_cache.delete(pdfcode);
            pagedoc = undefined;
        }
    }
    // Not in cache, so find an entry and add it to the cache
    if (!pagedoc) {
        for (const journal of game.journal) {
            for (const page of journal.pages) {
                if (page.type === 'pdf' &&
                    page.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE) == pdfcode) {
                    code_cache.set(pdfcode, page.uuid);
                    pagedoc = page;
                    break;
                }
            }
            if (pagedoc) break;
        }
        // Stop now if no page was found
        if (!pagedoc) {
            console.error(`openPdfByCode: unable to find PDF with code '${pdfcode}'`)
            ui.notifications.error(game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Error.NoPDFWithCode`))
            return;
        }
    }

    // Render journal entry showing the appropriate page (JournalEntryPage#_onClickDocumentLink)
    let pageoptions = { pageId : pagedoc.id };
    if (options?.page) pageoptions.anchor = `page=${options.page}`;
    if (options?.uuid) pageoptions.showUuid = options.uuid;
    // Maybe options contains { uuid: 'Actor.xyz' }
    pagedoc.parent.sheet.render(true, pageoptions);
}


export function deleteOutlines() {
    if (!game.user.isGM) {
        ui.notifications.warn(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.Warning.OnlyGM`, {function:"deleteOutlines()"}));
        return;
    }
    for (const journal of game.journal) {
        for (const page of journal.pages) {
            if (page.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC)) {
                console.log(`Removed stored Outline for '${page.name}' in '${journal.name}'`)
                page.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_TOC);
                if (page.sheet?.toc) delete page.sheet.toc;
            }
        }
    }
}