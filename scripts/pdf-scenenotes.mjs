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

Hooks.on('activateNote', (note, options) => {
    let pdfpage = note.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.PIN_PDF_PAGE);
    if (typeof pdfpage === 'number') options.anchor = `page=${pdfpage}`;
    return true;
})

Hooks.on("renderNoteConfig", (app,html,data) => {
    // Add option to specify the PDF page in the settings.
    let pdfpage = data.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.PIN_PDF_PAGE) ?? "";
    let prompt = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.noteConfig.pdfPagePrompt`);
	let label = $(`<div class='form-group'><label>${prompt}</label><div class='form-fields'><input name="flags.${PDFCONFIG.MODULE_NAME}.${PDFCONFIG.PIN_PDF_PAGE}" type='number' value="${pdfpage}"/></div></div>`)
	html.find("input[name='text']").parent().parent().after(label);

    // Force a recalculation of the height
	if (!app._minimized) {
		let pos = app.position;
		pos.height = 'auto'
		app.setPosition(pos);
	}
})