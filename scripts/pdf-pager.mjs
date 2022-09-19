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

const MODULE_NAME="pdf-pager";
const CONFIG_ALWAYS_LOAD_PDF="alwaysLoadPdf";
const FLAG_PAGE_OFFSET="pageOffset";

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
 * 
 * iYV6uMnFwdgZORxi
 */

Hooks.once('init', () => {
    // Set up module settings
    game.settings.register(MODULE_NAME, CONFIG_ALWAYS_LOAD_PDF, {
		name: "Immediately Display PDF",
		hint: "When checked, then PDFs will be immediately displayed when their page is selected, removing the need to press the 'Load PDF' button",
		scope: "world",
		type:  Boolean,
		default: true,
		config: true
	});
});

Hooks.once('ready', async () => {
    // Need to capture the PDF page number
    libWrapper.register(MODULE_NAME, 'JournalPDFPageSheet.prototype._renderInner', my_render_inner, libWrapper.WRAPPER);
    libWrapper.register(MODULE_NAME, 'JournalSheet.prototype._render', my_render, libWrapper.WRAPPER);
    await migratePDFoundry({onlyIfEmpty:true});
});

// Ugly hack to get the PAGE number from the JournalSheet#render down to the JournalPDFPageSheet#render
let pdfpageid=undefined;
let pdfpagenumber=undefined;

/**
 * my_journal_render reads the page=xxx anchor from the original link, and stores it temporarily for use by renderJournalPDFPageSheet later
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
 * Adds the "Page Offset" field to the PDF page editor window.
 * @param {*} wrapper from libWrapper
 * @param  {...any} args an array of 1 element, the first element being the same as the data passed to the render function
 * @returns 
 */
async function my_render_inner(wrapper, ...args) {
    let html = wrapper(...args);   // jQuery
    if (this.isEditable) {
        html = await html;  // resolve the Promise before using the value
        const page_offset = args[0].document.getFlag(MODULE_NAME,FLAG_PAGE_OFFSET);
        const value = page_offset ? ` value="${page_offset}"` : "";
        const elem = html.find('div.picker');
        const label = game.i18n.localize(`${MODULE_NAME}.PageOffset.Label`);
        const newelem = `<div class="form-group"><label>${label}</label><input class="pageOffset" type="number" name="flags.${MODULE_NAME}.${FLAG_PAGE_OFFSET}"${value}"/></div>`;
        $(newelem).insertAfter(elem);
    }
    return html;
}

/**
 * Hook to replace "Load PDF" button with actual PDF document
 * @param {JournalPDFPageSheet} [sheet] Sheet for renderJournalSheet and renderActorSheet hooks
 * @param {jQuery}     [html]  HTML  for renderJournalSheet and renderActorSheet hooks
 * @param {Object}     [data]  Data (data.document = JournalEntryPage)
 */
Hooks.on("renderJournalPDFPageSheet", async function(sheet, html, data) {
    // If editing the page, then don't try to press the button.
    if (sheet.isEditable) return;

    // Sanity check for using the correct pdfpage value.
    if (sheet.object._id !== pdfpageid)
        pdfpagenumber = undefined;

    // html.find('div.load-pdf') doesn't work
    if (pdfpagenumber || game.settings.get(MODULE_NAME, CONFIG_ALWAYS_LOAD_PDF)) {
        $("div.load-pdf").replaceWith ( (index,a) => {
            // Immediately do JournalPagePDFSheet#_onLoadPDF
            const page_offset = data.document.getFlag(MODULE_NAME,FLAG_PAGE_OFFSET);
            const page_marker = pdfpagenumber ? `#page=${pdfpagenumber+(page_offset||0)}` : '';
            pdfpagenumber = undefined;  // only use the buffered page number once
            return `<iframe src="scripts/pdfjs/web/viewer.html?${sheet._getViewerParams()}${page_marker}"/>`;
	    });
    }
});
