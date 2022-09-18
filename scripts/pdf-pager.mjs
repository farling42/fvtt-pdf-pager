const MODULE_NAME="pdf-pager";

Hooks.once('init', async function() {
    // Set up module settings
});

Hooks.once('ready', async function() {
    // Hook to process @PDF[link|page=xxx]{name}

    // Hook to replace "Load PDF" button with actual PDF document
});

/**
 * Hook to replace "Load PDF" button with actual PDF document
 * @param {JournalPDFPageSheet} [sheet] Sheet for renderJournalSheet and renderActorSheet hooks
 * @param {jQuery}     [html]  HTML  for renderJournalSheet and renderActorSheet hooks
 * @param {Object}     [data]  Data (data.document = JournalEntryPage)
 */
Hooks.on("renderJournalPDFPageSheet", async function(sheet, html, data) {
    const page_flags = data.document.getFlag(MODULE_NAME);
    // Don't do anything if editting the page.
    if (sheet.isEditable) {
        const value = page_flags?.page_offset ? ` value=${page_flags?.page_offset}` : "";
        $(`<div class="form-group picker"><label>Page Offset</label><input class="number" ${value}"/></div>`).insertBefore(html.find('footer'));
        // Now hook into the field being changed: <button type="submit"
        
        return;
    }

    // html.find('div.load-pdf') doesn't work
    $("div.load-pdf").replaceWith ( (index,a) => {
        // Immediately do JournalPagePDFSheet#_onLoadPDF
        //const page = data.document  (JournalEntryPage)
        const page_number = 22;
        const page_offset = page_flags?.page_offset || 0;
        const page_marker = page_number ? `#page=${page_number+page_offset}` : '';
        // return a;   // if no change is required.
        return `<iframe src="scripts/pdfjs/web/viewer.html?${sheet._getViewerParams()}${page_marker}"/>`;
	});
});
