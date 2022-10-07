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
import { initEditor } from './pdf-editable.mjs';

export class PDFActorSheet extends ActorSheet {    

  get template() {
    return `modules/${PDFCONFIG.MODULE_NAME}/templates/actor-pdf-sheet.hbs`;
  }    

  getData() {
    const context = super.getData();
    // Ensure we have the correct prefix (if any) on the file.
    let file = game.settings.get(PDFCONFIG.MODULE_NAME, `${context.actor.type}Sheet`);
    context.pdfFilename = foundry.utils.getRoute(file);
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);      
    initEditor(html.find('iframe'), this.object.uuid);
  }      
}


Hooks.once('init', () => {
    Actors.registerSheet(PDFCONFIG.MODULE_NAME, PDFActorSheet, {
        types: game.template.Actor.types,
        makeDefault: false,
        label: "PDF Sheet"
    } )
});


export function configureActorSettings() {
  const name  = PDFCONFIG.MODULE_NAME;
  for (let type of game.template.Actor.types) {
    let param = `${type}Sheet`;
    let basename = game.i18n.localize(`${name}.actorSheet.Name`);
    let basehint = game.i18n.localize(`${name}.actorSheet.Hint`)
    game.settings.register(name, param, {
		  name: basename.replace('%1',type),
		  hint: basehint.replace('%1',type),
		  scope: "world",
		  type:  String,
		  default: 'userdata/5E_CharacterSheet_Fillable.pdf',
      filePicker: true,
		  config: true
	  });
  }
}