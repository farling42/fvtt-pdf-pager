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

import { openPDFByCode } from './pdf-pager.mjs';
import { migratePDFoundry, replacePDFlinks } from './pdf-migrate.mjs';
import { registerActorMapping, registerItemMapping } from './pdf-editable.mjs';
import { configureMenuSettings } from './pdf-menu.mjs';
import { configureActorSettings } from './pdf-actorsheet.mjs';

export let PDFCONFIG = {
    MODULE_NAME             : "pdf-pager",
	// World config flags
    ALWAYS_LOAD_PDF         : "alwaysLoadPdf",
    CREATE_PDF_LINK_ON_DROP : "dropPdfLink",
	FORM_FILL_PDF           : "formFillPdf",
	ACTOR_CONFIG            : "actorConfig",
	ITEM_CONFIG             : "itemConfig",
	// Flags on an Actor
    FLAG_OFFSET             : "pageOffset",
    FLAG_CODE               : "code",
	FLAG_FIELDTEXT          : "fieldText"
};

Hooks.once('ready', () => {
    // Set up module settings
    let name  = PDFCONFIG.MODULE_NAME;
    let param = PDFCONFIG.ALWAYS_LOAD_PDF;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  Boolean,
		default: true,
		config: true
	});
    
    param = PDFCONFIG.CREATE_PDF_LINK_ON_DROP;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  Boolean,
		default: true,
		config: true
	});

    param = PDFCONFIG.FORM_FILL_PDF;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  Boolean,
		default: true,
		config: true
	});

	// Ideally ACTOR_CONFIG and ITEM_CONFIG would use a TextArea.
	// We can't simply patch the SettingsConfig.prototype._renderInner to swap "<input" for "<textarea" because
	// the value is stored differently (and so would have to be retrieved in a different manner):
	// <input type="text" value="actorConfig"/>
	// <textarea name="pdf-pager.actorConfig" rows="4"> has the text between <textarea>actorConfig</textarea>
	//
	// (both would also have attributes:  name="pdf-pager.actorConfig" data-dtype="String"
    param = PDFCONFIG.ACTOR_CONFIG;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  String,
		default: "",
		config: true
	});

    param = PDFCONFIG.ITEM_CONFIG;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  String,
		default: "",
		config: true
	});

	configureMenuSettings();
	configureActorSettings();

    if (!ui.pdfpager) ui.pdfpager = { openPDFByCode, migratePDFoundry, replacePDFlinks, registerActorMapping, registerItemMapping };
});