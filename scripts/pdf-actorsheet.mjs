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

/**
 * Support a new "PDF Actor Sheet" template which will show a PDF instead of a normal Actor window.
 * 
 * 
 */

import { PDFCONFIG } from './pdf-config.mjs';
import { initEditor, logPdfFields, getPdfViewer } from './pdf-editable.mjs';
import { PDFDataBrowser } from './pdf-databrowser.mjs';

export class PDFSheetConfig extends FormApplication {
  // this.object = PDFActorSheet or PDFItemSheet
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
    })
  }
  get template() {
    return `modules/${PDFCONFIG.MODULE_NAME}/templates/choose-pdf.hbs`;
  }
  get title() {
    return game.i18n.format(`${PDFCONFIG.MODULE_NAME}.ChoosePdfForm.Title`, {name: this.object.document.name});
  }
  getData() {
    return {
      filename: this.object.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF)
    }
  }
  /**
   * 
   * @param {Event} event 
   * @param {Object} formData 
   * @returns 
   */
  async _updateObject(event, formData) {
    event.preventDefault();
    const doc = this.object.document;
    const oldflag = doc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF);
    if (formData.filename == oldflag) return;

    if (formData.filename) {
      console.log(`Configuring Actor '${doc.name}' to use PDF sheet '${formData.filename}'`)
      doc.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF, formData.filename)
    } else {
      console.log(`Removing custom PDF sheet for Actor '${doc.name}'`)
      doc.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF)
    }
    // Regenerate the PDFActorSheet with the new PDF
    this.object.render(true);
  }
}


export class PDFActorSheet extends ActorSheet {    

  /**
   * 
   * @param {Actor} actor 
   * @param {Object} options 
   */
  constructor(actor, options) {
    super(actor,options);
    let winsize = actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE);
    if (winsize) {
      this.position.width  = winsize.width;
      this.position.height = winsize.height;
    }
  }

  get template() {
    return `modules/${PDFCONFIG.MODULE_NAME}/templates/pdf-sheet.hbs`;
  }    

  async getData() {
    // This function is async in case the game system has defined their subclass of ActorSheet to have an async function.
    // I have no idea why that should matter, but it definitely does (at least for the Cypher System game system)
    const context = await super.getData();
    // Ensure we have the correct prefix (if any) on the file.
    const actor = this.document;
    // Check for a custom PDF local to the Actor before using the generic sheet.
    let pdffile = actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF) || game.settings.get(PDFCONFIG.MODULE_NAME, `${context.actor.type}Sheet`);
    // URL.parseSafe is to cope with where a user has specified a full URL for the PDF path
    // instead of a file relative to the Foundry USERDATA area.
    // (This would typically be an issue on The Forge hosting service.)
    context.pdfFilename = URL.parseSafe(pdffile) ? pdffile : foundry.utils.getRoute(pdffile);

    // Perhaps set zoom level
    context.zoomLevel = "";
    let default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM);
    if (default_zoom && default_zoom !== 'none') {
        console.log(`displaying actor PDF with default zoom of ${default_zoom}%`);
        if (default_zoom === 'number') default_zoom = game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.DEFAULT_ZOOM_NUMBER)
        context.zoomLevel = `#zoom=${default_zoom}`;
    }
    return context;
  }

  /**
   * 
   * @param {jQuery} html 
   */
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

    // No extra buttons if we can't edit the actor.
    if (this.document.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER ||
        !game.settings.get(PDFCONFIG.MODULE_NAME, PDFCONFIG.SHOW_TITLE_BAR_BUTTONS)) return buttons;

    buttons.unshift({
      label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.actorSheetButton.CustomPDF`),
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
        label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.actorSheetButton.InspectData`),
        onclick: () => {
          new PDFDataBrowser(this.document).render(true);
        },
      });

      buttons.unshift({
        icon: 'fas fa-search',
        class: 'pdf-list-fields',
        label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.actorSheetButton.ShowPdfFields`),
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

  /**
   * 
   * @param {Boolean} force 
   * @param {Object} context 
   */
  render(force=false, context={}) {
    // Only actually call the render function if the window is not currently rendered,
    // since the `initEditor` call will otherwise handle changes to actor field data.
    if (!this.rendered && this.document.permission >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) super.render(force,context);
  }

  /**
   * Remember the current window size whenever it is resized.
   * @param {Event} event 
   */
  _onResize(event) {
    super._onResize(event);
    this.actor.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE, {width: this.position.width, height: this.position.height});
  }
}



let defined_types = [];

export function configureActorSettings() {
  const modulename = PDFCONFIG.MODULE_NAME;

  function updateSheets() {

    const actorTypes = game.documentTypes["Actor"].filter(t => t !== CONST.BASE_DOCUMENT_TYPE);
    let types = []
    for (const type of actorTypes) {
      let param = `${type}Sheet`;
      if (game.settings.get(modulename, param)?.length) {
        types.push(type);
      }
    }

    // Remove any old registered sheets
    if (types != defined_types) {
      console.log(`Changing registered Actor sheets to ${JSON.stringify(types)}`)
      defined_types = types;
      Actors.unregisterSheet(modulename, PDFActorSheet);

      // Add new list of registered sheets
      if (types.length) {
          let options = {
            makeDefault: false,
            label: game.i18n.format(`${modulename}.PDFSheetName`)
          }
          // Simple World Building doesn't set the 'types' field, and on Foundry 11 it won't work if WE set the 'types' field.
          if (actorTypes.length > 1) options.types = types;
          Actors.registerSheet(modulename, PDFActorSheet, options)
      }
    }
  }

  for (let [type,label] of Object.entries(CONFIG.Actor.typeLabels)) {
    let actorname = game.i18n.has(label) ? game.i18n.localize(label) : type;
    game.settings.register(modulename, `${type}Sheet`, {
		  name: game.i18n.format(`${modulename}.actorSheet.Name`, {name: actorname}),
		  hint: game.i18n.format(`${modulename}.actorSheet.Hint`, {name: actorname}),
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
  const actorTypes = game.documentTypes["Actor"].filter(t => t !== CONST.BASE_DOCUMENT_TYPE);
  // input for V10/11, file-picker for V12
  moduleTab
    .find(`input[name="${PDFCONFIG.MODULE_NAME}.${actorTypes[0]}Sheet"],file-picker[name="${PDFCONFIG.MODULE_NAME}.${actorTypes[0]}Sheet"]`)
    .closest('div.form-group')
    .before(
      '<h2 class="setting-header">' +
        game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.TitleActorPDFs`) +
        '</h2>'
    )
})