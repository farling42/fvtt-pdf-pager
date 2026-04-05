/*
PDF-PAGER

Copyright © 2023 Martin Smith

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

/**
 * Support a new "PDF Item Sheet" template which will show a PDF instead of a normal Item window.
 * 
 * 
 */

import { PDFCONFIG } from './pdf-config.mjs';
import { initEditor, logPdfFields, getPdfViewer } from './pdf-editable.mjs';
import { PDFSheetConfig } from './pdf-sheetconfig.mjs';
import { PDFDataBrowser } from './pdf-databrowser.mjs';

export class PDFItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

	static DEFAULT_OPTIONS = {
		actions: {
			chooseImage: PDFItemSheet.#onChooseImage,
			choosePDF: PDFItemSheet.#onChoosePdf,
			browseData: PDFItemSheet.#onBrowseData,
			listFields: PDFItemSheet.#onListFields,
		},
		window: {
			resizable: true,
			controls: [
				{
					icon: "fas fa-user",
					label: `${PDFCONFIG.MODULE_NAME}.itemSheetButton.chooseImage`,
					action: 'chooseImage',
				},
				{
					icon: "fas fa-file-pdf",
					label: `${PDFCONFIG.MODULE_NAME}.itemSheetButton.CustomPDF`,
					action: 'choosePDF',

				},
				{
					icon: 'fas fa-search',
					label: `${PDFCONFIG.MODULE_NAME}.itemSheetButton.InspectData`,
					action: 'browseData',
				},
				{
					icon: 'fas fa-search',
					label: `${PDFCONFIG.MODULE_NAME}.itemSheetButton.ShowPdfFields`,
					action: 'listFields'
				}
			]
		}
	}

	static PARTS = {
		content: { template: `modules/${PDFCONFIG.MODULE_NAME}/templates/pdf-sheet.hbs` }
	}

	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		let winsize = this.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE);
		if (winsize) {
			options.position.width = winsize.width;
			options.position.height = winsize.height;
		}
	}

	async _prepareContext(options) {
		const context = await super._prepareContext(options);

		// Ensure we have the correct prefix (if any) on the file.
		const item = this.document;
		// Check for a custom PDF local to the Item before using the generic sheet.
		let pdffile = item.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF) || game.settings.get(PDFCONFIG.MODULE_NAME, `${item.type}Sheet`);
		// URL.parse is to cope with where a user has specified a full URL for the PDF path
		// instead of a file relative to the Foundry USERDATA area.
		// (This would typically be an issue on The Forge hosting service.)
		context.pdfFilename = URL.parse(pdffile) ? pdffile : foundry.utils.getRoute(pdffile);

		// Perhaps set zoom level
		context.zoomLevel = "";
		let default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM);
		if (default_zoom && default_zoom !== 'none') {
			console.log(`displaying item PDF with default zoom of ${default_zoom}%`);
			if (default_zoom === 'number') default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM_NUMBER)
			context.zoomLevel = `#zoom=${default_zoom}`;
		}
		return context;
	}

	_onRender(context, options) {
		initEditor(this.element.querySelector('iframe'), this.document.uuid);
	}

	/**
	 * 
	 * @param {Event} event 
	 */
	static #onChoosePdf() {
		new PDFSheetConfig({
			object: this,
			position: {
				top: this.position.top + 40,
				left: this.position.left + ((this.position.width - PDFSheetConfig.DEFAULT_OPTIONS.width) / 2)
			}
		}).render(true);
		console.log('choose a custom PDF')
	}

	/**
	 * Choose an image for the item/actor
	 */
	static async #onChooseImage() {
		let filePicker = new FilePicker({
			type: "image",
			current: this.document.img,
			callback: path => {
				this.document.update({ img: path })
			},
		});
		filePicker.render();
	}

	static #onBrowseData() {
		new PDFDataBrowser(this.document).render(true);
	}

	static #onListFields() {
		const pdfviewer = getPdfViewer(this.form);
		if (pdfviewer)
			logPdfFields(pdfviewer);
		else
			ui.notifications.warn(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.Warning.NoPDFforListFields`, { docname: this.document.name }));
	}

	static canEdit() {
		return this.document.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER &&
			game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.SHOW_TITLE_BAR_BUTTONS);
	}

	static canEditGM() {
		return game.user.isGM &&
			game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.SHOW_GM_BUTTONS);
	}

	// Only actually call the render function if the window is not currently rendered,
	// since the `initEditor` call will otherwise handle changes to item field data.
	/**
	 * 
	 * @param {Boolean} force 
	 * @param {Object} context 
	 */
	render(force = false, context = {}) {
		if (!this.rendered && this.document.permission >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
			super.render(force, context);
	}

	/**
	 * 
	 * @param {Event} event 
	 */
	_onResize(event) {
		super._onResize(event);
		this.item.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE,
			{ width: this.position.width, height: this.position.height });
	}
}



let defined_types = [];

export function configureItemSettings() {
	const modulename = PDFCONFIG.MODULE_NAME;

	function updateSheets() {

		const itemTypes = game.documentTypes["Item"].filter(t => t !== CONST.BASE_DOCUMENT_TYPE);
		let types = []
		for (const type of itemTypes) {
			let param = `${type}Sheet`;
			if (game.settings.get(modulename, param)?.length) {
				types.push(type);
			}
		}

		// Remove any old registered sheets
		if (types != defined_types) {
			console.log(`Changing registered Item sheets to ${JSON.stringify(types)}`)
			defined_types = types;
			foundry.documents.collections.Items.unregisterSheet(modulename, PDFItemSheet);

			// Add new list of registered sheets
			if (types.length) {
				let options = {
					makeDefault: false,
					label: game.i18n.format(`${modulename}.PDFSheetName`)
				}
				// Simple World Building doesn't set the 'types' field, and on Foundry 11 it won't work if WE set the 'types' field.
				if (itemTypes.length > 1) options.types = types;
				foundry.documents.collections.Items.registerSheet(modulename, PDFItemSheet, options)
			}
		}
	}

	for (let [type, label] of Object.entries(CONFIG.Item.typeLabels)) {
		let itemname = game.i18n.has(label) ? game.i18n.localize(label) : type;
		game.settings.register(modulename, `${type}Sheet`, {
			name: game.i18n.format(`${modulename}.itemSheet.Name`, { name: itemname }),
			hint: game.i18n.format(`${modulename}.itemSheet.Hint`, { name: itemname }),
			scope: "world",
			type: String,
			default: "",
			filePicker: true,
			onChange: value => { updateSheets() },
			config: true
		});
	}

	updateSheets();
}

Hooks.on('renderSettingsConfig', (app, html, options) => {
	const moduleTab = html.querySelectorAll(`.tab[data-tab=${PDFCONFIG.MODULE_NAME}]`);
	const itemTypes = game.documentTypes["Item"].filter(t => t !== CONST.BASE_DOCUMENT_TYPE);
	const label = document.createElement("h4");
	label.classList.add("setting-header");
	label.innerText = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.TitleItemPDFs`);

	let picker = moduleTab[0].querySelectorAll(`file-picker[name="${PDFCONFIG.MODULE_NAME}.${itemTypes[0]}Sheet"]`);
	if (picker) picker[0].closest('div.form-group').before(label);
})