import { PDFCONFIG } from './pdf-config.mjs';

export class PDFSheetConfig extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

  // this.object = PDFActorSheet or PDFItemSheet

  static DEFAULT_OPTIONS = {
    tag: "form",
    position: { width: 600 },
    form: {
      closeOnSubmit: true,
      handler: PDFSheetConfig.#onSubmit
    }
  }

  static PARTS = {
    content: { template: `modules/${PDFCONFIG.MODULE_NAME}/templates/choose-pdf.hbs` }
  }

  get title() {
    return game.i18n.format(`${PDFCONFIG.MODULE_NAME}.ChoosePdfForm.Title`, { name: this.options.object.document.name });
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.filename = this.options.object.document.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF);
    return context;
  }

  /**
   * 
   * @param {Event} event 
   * @param {Object} submitData 
   * @returns 
   */
  static async #onSubmit(event, _form, submitData) {
    event.preventDefault();
    const doc = this.options.object.document;
    const oldvalue = doc.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF);
    const newvalue = submitData.object.filename;
    if (newvalue == oldvalue) return;

    if (newvalue) {
      console.log(`Configuring Actor '${doc.name}' to use PDF sheet '${newvalue}'`)
      doc.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF, newvalue)
    } else {
      console.log(`Removing custom PDF sheet for Actor '${doc.name}'`)
      doc.unsetFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_CUSTOM_PDF)
    }
    // Regenerate the PDFActorSheet with the new PDF
    //this.object.render(true);
  }
}