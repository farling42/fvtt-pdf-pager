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

Hooks.once('ready', () => {
    // Need to capture the PDF page number
    libWrapper.register(MODULE_NAME, 'JournalSheet.prototype._render', my_journal_render, libWrapper.WRAPPER);
});

// Ugly hack to get the PAGE number from the JournalSheet#render down to the JournalPDFPageSheet#render
let pdfpageid=undefined;
let pdfpage=undefined;

/**
 * my_journal_render reads the page=xxx anchor from the original link, and stores it temporarily for use by renderJournalPDFPageSheet later
 */
async function my_journal_render(wrapper,force,options) {
    if (options.anchor?.startsWith('page=')) {
        pdfpageid = options.pageId;
        pdfpage   = +options.anchor.slice(5);
        delete options.anchor;   // we don't want the wrapper trying to set the anchor
    }
    let result = await wrapper(force,options);
    pdfpageid = undefined;
    pdfpage   = undefined;
    return result;
}

/**
 * Hook to replace "Load PDF" button with actual PDF document
 * @param {JournalPDFPageSheet} [sheet] Sheet for renderJournalSheet and renderActorSheet hooks
 * @param {jQuery}     [html]  HTML  for renderJournalSheet and renderActorSheet hooks
 * @param {Object}     [data]  Data (data.document = JournalEntryPage)
 */
Hooks.on("renderJournalPDFPageSheet", async function(sheet, html, data) {
    const page_offset = data.document.getFlag(MODULE_NAME,FLAG_PAGE_OFFSET);
    // Don't do anything if editting the page.
    if (sheet.isEditable) {
        const value = page_offset ? ` value="${page_offset}"` : "";
        $(`<div class="form-group"><label>Page Offset</label><input class="pageOffset" type="number" name="flags.${MODULE_NAME}.${FLAG_PAGE_OFFSET}" ${value}"/></div>`).insertBefore(html.find('footer'));
        return;
    }
    // Sanity check for using the correct pdfpage value.
    if (sheet.object._id !== pdfpageid)
        pdfpage = undefined;

    // html.find('div.load-pdf') doesn't work
    if (pdfpage || game.settings.get(MODULE_NAME, CONFIG_ALWAYS_LOAD_PDF)) {
        $("div.load-pdf").replaceWith ( (index,a) => {
            // Immediately do JournalPagePDFSheet#_onLoadPDF
            //const page = data.document  (JournalEntryPage)
            const page_marker = pdfpage ? `#page=${pdfpage+(page_offset||0)}` : '';
            pdfpage = undefined;
            // return a;   // if no change is required.
            return `<iframe src="scripts/pdfjs/web/viewer.html?${sheet._getViewerParams()}${page_marker}"/>`;
	    });
    }
});
