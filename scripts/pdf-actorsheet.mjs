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
import { PDFActorDataBrowser } from './pdf-actorbrowser.mjs';

export class PDFActorSheetConfig extends FormApplication {
  // this.object = PDFActorSheet
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 600,
    })
  }
  get template() {
    return `modules/${PDFCONFIG.MODULE_NAME}/templates/actor-choose-pdf.hbs`;
  }
  get title() {
    const actor = this.object.document;
    return game.i18n.format(`${PDFCONFIG.MODULE_NAME}.ChoosePdfForm.Title`, {name: actor.name});
  }
  getData() {
    const actor = this.object.document;
    return {
      filename: actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF)
    }
  }
  async _updateObject(event, formData) {
    event.preventDefault();
    const actor = this.object.document;
    const oldflag = actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF);
    if (formData.filename == oldflag) return;

    if (formData.filename) {
      console.log(`Configuring Actor '${actor.name}' to use PDF sheet '${formData.filename}'`)
      actor.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF, formData.filename)
    } else {
      console.log(`Removing custom PDF sheet for Actor '${actor.name}'`)
      actor.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF)
    }
    // Regenerate the PDFActorSheet with the new PDF
    this.object.render(true);
  }
}


export class PDFActorSheet extends ActorSheet {    

  constructor(actor, options) {
    super(actor,options);
    let winsize = actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE);
    if (winsize) {
      this.position.width  = winsize.width;
      this.position.height = winsize.height;
    }
  }

  get template() {
    return `modules/${PDFCONFIG.MODULE_NAME}/templates/actor-pdf-sheet.hbs`;
  }    

  getData() {
    const context = super.getData();
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

  activateListeners(html) {
    super.activateListeners(html);      
    initEditor(html.find('iframe'), this.object.uuid);
  }

  _onChoosePdf(event) {
    event.preventDefault();
    new PDFActorSheetConfig(this, {
      top: this.position.top + 40,
      left: this.position.left + ((this.position.width - PDFActorSheetConfig.defaultOptions.width) / 2)
    }).render(true);
    console.log('choose a custom PDF')
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    buttons.unshift({
      label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.actorSheetButton.CustomPDF`),
      class: "configure-custom-pdf",
      icon:  "fas fa-file-pdf",
      onclick: event => {
        this._onChoosePdf(event);
      }
    })

    buttons.unshift({
      icon: 'fas fa-search',
      class: 'pdf-browse-data',
      label: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.actorSheetButton.InspectData`),
      onclick: () => {
          new PDFActorDataBrowser(this.document).render(true);
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
          ui.notifications.warn(game.i18n.format(`${PDFCONFIG.MODULE_NAME}.Warning.NoPDFforListFields`, {docname: this.document.name }));
      },
    });

    return buttons;
  }

  // Only actually call the render function if the window is not currently rendered,
  // since the `initEditor` call will otherwise handle changes to actor field data.
  render(force=false, context={}) {
    if (!this.rendered) super.render(force,context);
  }

  _onResize(event) {
    super._onResize(event);
    this.actor.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_WINDOW_SIZE, {width: this.position.width, height: this.position.height});
  }
}



let defined_types = [];

export function configureActorSettings() {
  const modulename = PDFCONFIG.MODULE_NAME;

  function updateSheets() {

    let types = []
    for (const type of game.template.Actor.types) {
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
          if (game.template.Actor.types.length > 1) options.types = types;
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
  const moduleTab = $(app.form).find(`.tab[data-tab=${PDFCONFIG.MODULE_NAME}]`);
  moduleTab
    .find(`input[name=${PDFCONFIG.MODULE_NAME}\\.${game.template.Actor.types[0]}Sheet]`)
    .closest('div.form-group')
    .before(
      '<h2 class="setting-header">' +
        game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.TitleActorPDFs`) +
        '</h2>'
    )
})