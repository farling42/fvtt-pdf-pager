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

import { PDFCONFIG } from './pdf-config.mjs'

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
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'JournalPDFPageSheet.prototype._renderInner', my_render_inner, libWrapper.WRAPPER);
    libWrapper.register(PDFCONFIG.MODULE_NAME, 'JournalSheet.prototype._render', my_render, libWrapper.WRAPPER);
    await ui.pdfpager.migratePDFoundry({onlyIfEmpty:true});
});

// Ugly hack to get the PAGE number from the JournalSheet#render down to the JournalPDFPageSheet#render
let pdfpageid=undefined;
let pdfpagenumber=undefined;

/**
 * Adds the "Page Offset" field to the JournalPDFPageSheet EDITOR window.
 * @param {*} wrapper from libWrapper
 * @param  {...any} args an array of 1 element, the first element being the same as the data passed to the render function
 * @returns 
 */
 async function my_render_inner(wrapper, ...args) {
    let html = wrapper(...args);   // jQuery
    if (this.isEditable) {
        html = await html;  // resolve the Promise before using the value
        const pagedoc = args[0].document;
        const page_offset  = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET);
        const value_offset = page_offset ? ` value="${page_offset}"` : "";
        const label_offset = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.PageOffset.Label`);
        const elem_offset  = `<div class="form-group"><label>${label_offset}</label><input class="pageOffset" type="number" name="flags.${PDFCONFIG.MODULE_NAME}.${PDFCONFIG.FLAG_OFFSET}"${value_offset}/></div>`;

        const page_code   = pagedoc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
        const value_code  = page_code ? ` value="${page_code}"` : "";
        const label_code  = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Code.Label`);
        const elem_code   = `<div class="form-group"><label>${label_code}</label><input class="pageCode" type="text" name="flags.${PDFCONFIG.MODULE_NAME}.${PDFCONFIG.FLAG_CODE}"${value_code}/></div>`;

        const elem_hook = html.find('div.picker');
        $(elem_offset + elem_code).insertAfter(elem_hook);
    }
    return html;
}

/**
 * my_journal_render reads the page=xxx anchor from the original link, and stores it temporarily for use by renderJournalPDFPageSheet later
 * Wraps JournalSheet#_render
 */
async function my_render(wrapper,force,options) {
    if (options.anchor?.startsWith('page=')) {
        pdfpageid     = options.pageId;
        pdfpagenumber = +options.anchor.slice(5);
        delete options.anchor;   // we don't want the wrapper trying to set the anchor
    }
    let result = await wrapper(force,options);
    pdfpagenumber = undefined;  // in case renderJournalPDFPageSheet didn't get called
    return result;
}

/**
 * Hook to replace "Load PDF" button with actual PDF document
 * @param {JournalPDFPageSheet} [sheet] Sheet for renderJournalSheet hooks
 * @param {jQuery}     [html]  HTML  for renderJournalSheet hooks
 * @param {Object}     [data]  Data (data.document = JournalEntryPage)
 */
Hooks.on("renderJournalPDFPageSheet", async function(sheet, html, data) {
    // If editing the page, then don't try to press the button.
    if (sheet.isEditable) return;

    // Sanity check for using the correct pdfpage value.
    if (sheet.object._id !== pdfpageid)
        pdfpagenumber = undefined;

    // html.find('div.load-pdf') doesn't work
    if (pdfpagenumber || game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.ALWAYS_LOAD_PDF)) {
        $("div.load-pdf").replaceWith ( (index,a) => {
            // Immediately do JournalPagePDFSheet#_onLoadPDF
            const page_offset = data.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_OFFSET);
            const page_marker = pdfpagenumber ? `#page=${pdfpagenumber+(page_offset||0)}` : '';
            pdfpagenumber = undefined;  // only use the buffered page number once
            return `<iframe src="scripts/pdfjs/web/viewer.html?${sheet._getViewerParams()}${page_marker}"/>`;
	    });
    }
});


let code_cache = new Map();

/**
 * 
 * @param {*} pdfcode The short code of the PDF page to be displayed
 * @param {*} options Can include {page: <number>}
 */
export function openPDFByCode(pdfcode, options={}) {
    let uuid = code_cache.get(pdfcode);
    // Check cache value is still valid
    if (uuid) {
        let code = fromUuidSync(uuid)?.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE);
        if (!code) {
            // CODE no longer matches, so remove from cache
            code_cache.delete(pdfcode);
            uuid = null;
        }
    }
    // Not in cache, so find an entry and add it to the cache
    if (!uuid) {
        for (const journal of game.journal) {
            for (const page of journal.pages) {
                if (page.type === 'pdf' &&
                    page.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CODE) == pdfcode) {
                    uuid = page.uuid;
                    code_cache.set(pdfcode, uuid);
                    break;
                }
            }
            if (uuid) break;
        }
    }

    // Now request that the corresponding page be loaded.
    if (!uuid) {
        console.error(`openPdfByCode: unable to find PDF with code '${pdfcode}'`)
        ui.notifications.error(game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Error.NoPDFWithCode`))
        return;
    }
    let pagedoc = fromUuidSync(uuid);
    if (!pagedoc) {
        console.error(`openPdfByCode failed to retrieve document uuid '${uuid}`)
        ui.notifications.error(game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.Error.FailedLoadPage`))
        return;
    }
    let pageoptions = { pageId: pagedoc.id };
    if (options?.page) pageoptions.anchor = `page=${options.page}`;

    // Render journal entry showing the appropriate page (JOurnalEntryPage#_onClickDocumentLink)
    pagedoc.parent.sheet.render(true, pageoptions);
}
