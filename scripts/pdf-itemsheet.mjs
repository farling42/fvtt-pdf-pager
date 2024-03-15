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
import { PDFSheetConfig } from './pdf-actorsheet.mjs';
import { PDFDataBrowser } from './pdf-databrowser.mjs';

export class PDFItemSheet extends ItemSheet {    

  constructor(item, options) {
    super(item,options);
    let winsize = item.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE);
    if (winsize) {
      this.position.width  = winsize.width;
      this.position.height = winsize.height;
    }
  }

  get template() {
    return `modules/${PDFCONFIG.MODULE_NAME}/templates/pdf-sheet.hbs`;
  }    

  getData() {
    const context = super.getData();
    // Ensure we have the correct prefix (if any) on the file.
    const item = this.document;
    // Check for a custom PDF local to the Item before using the generic sheet.
    let pdffile = item.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF) || game.settings.get(PDFCONFIG.MODULE_NAME, `${context.item.type}Sheet`);
    // URL.parseSafe is to cope with where a user has specified a full URL for the PDF path
    // instead of a file relative to the Foundry USERDATA area.
    // (This would typically be an issue on The Forge hosting service.)
    context.pdfFilename = URL.parseSafe(pdffile) ? pdffile : foundry.utils.getRoute(pdffile);

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

  activateListeners(html) {
    super.activateListeners(html);      
    initEditor(html.find('iframe'), this.object.uuid);
  }

  /**
   * 
   * @param {Event} event 
   */
  _onChoosePdf(event) {
    event.preventDefault();
    new PDFSheetConfig(this, {
      top: this.position.top + 40,
      left: this.position.left + ((this.position.width - PDFSheetConfig.defaultOptions.width) / 2)
    }).render(true);
    console.log('choose a custom PDF')
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();

    // No extra buttons if we can't edit the item.
    if (this.document.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER ||
       !game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.SHOW_TITLE_BAR_BUTTONS)) return buttons;

    buttons.unshift({
      label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.itemSheetButton.CustomPDF`),
      class: "configure-custom-pdf",
      icon:  "fas fa-file-pdf",
      onclick: event => {
        this._onChoosePdf(event);
      }
    })

    if (game.user.isGM) {
      buttons.unshift({
        icon: 'fas fa-search',
        class: 'pdf-browse-data',
        label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.itemSheetButton.InspectData`),
        onclick: () => {
          new PDFDataBrowser(this.document).render(true);
        },
      });

      buttons.unshift({
        icon: 'fas fa-search',
        class: 'pdf-list-fields',
        label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.itemSheetButton.ShowPdfFields`),
        onclick: (event) => {
          const pdfviewer = getPdfViewer(this.form);
          if (pdfviewer)
            logPdfFields(pdfviewer);
          else
            ui.notifications.warn(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.Warning.NoPDFforListFields`, { docname: this.document.name }));
        },
      });
    }

    return buttons;
  }

  // Only actually call the render function if the window is not currently rendered,
  // since the `initEditor` call will otherwise handle changes to item field data.
  /**
   * 
   * @param {Boolean} force 
   * @param {Object} context 
   */
  render(force=false, context={}) {
    if (!this.rendered && this.document.permission >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) super.render(force,context);
  }

  /**
   * 
   * @param {Event} event 
   */
  _onResize(event) {
    super._onResize(event);
    this.item.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE, {width: this.position.width, height: this.position.height});
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
      Items.unregisterSheet(modulename, PDFItemSheet);

      // Add new list of registered sheets
      if (types.length) {
          let options = {
            makeDefault: false,
            label: game.i18n.format(`${modulename}.PDFSheetName`)
          }
          // Simple World Building doesn't set the 'types' field, and on Foundry 11 it won't work if WE set the 'types' field.
          if (itemTypes.length > 1) options.types = types;
          Items.registerSheet(modulename, PDFItemSheet, options)
      }
    }
  }

  for (let [type,label] of Object.entries(CONFIG.Item.typeLabels)) {
    let itemname = game.i18n.has(label) ? game.i18n.localize(label) : type;
    game.settings.register(modulename, `${type}Sheet`, {
		  name: game.i18n.format(`${modulename}.itemSheet.Name`, {name: itemname}),
		  hint: game.i18n.format(`${modulename}.itemSheet.Hint`, {name: itemname}),
		  scope: "world",
		  type:  String,
		  default: "",
      filePicker: true,
      onChange: value => { updateSheets() },
		  config: true
	  });
  }

  updateSheets();
}

Hooks.on('renderSettingsConfig', (app, html, options) => {
  const moduleTab = html.find(`.tab[data-tab=${PDFCONFIG.MODULE_NAME}]`);
  const itemTypes = game.documentTypes["Item"].filter(t => t !== CONST.BASE_DOCUMENT_TYPE);
  // input for V10/11, file-picker for V12
  moduleTab
    .find(`input[name="${PDFCONFIG.MODULE_NAME}.${itemTypes[0]}Sheet"],file-picker[name="${PDFCONFIG.MODULE_NAME}.${itemTypes[0]}Sheet"]`)
    .closest('div.form-group')
    .before(
      '<h2 class="setting-header">' +
        game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.TitleItemPDFs`) +
        '</h2>'
    )
})