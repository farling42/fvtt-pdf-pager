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
import { initEditor, registerActorMapping } from './pdf-editable.mjs';

export let PDFCONFIG = {
    MODULE_NAME             : "pdf-pager",
	// World config flags
    ALWAYS_LOAD_PDF         : "alwaysLoadPdf",
    CREATE_PDF_LINK_ON_DROP : "dropPdfLink",
	FORM_FILL_PDF           : "formFillPdf",
	STORE_FIELDS_ON_ACTOR   : "storeOnActor",
	ACTOR_CONFIG            : "actorConfig",
	// Flags on an Actor
    FLAG_OFFSET             : "pageOffset",
    FLAG_CODE               : "code",
	FLAG_FIELDTEXT          : "fieldText"
};

Hooks.once('init', () => {
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

    param = PDFCONFIG.STORE_FIELDS_ON_ACTOR;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  Boolean,
		default: false,
		config: true
	});

    param = PDFCONFIG.ACTOR_CONFIG;
    game.settings.register(name, param, {
		name: game.i18n.localize(`${name}.${param}.Name`),
		hint: game.i18n.localize(`${name}.${param}.Hint`),
		scope: "world",
		type:  String,
		default: "",
		config: true
	});

    if (!ui.pdfpager) ui.pdfpager = { openPDFByCode, migratePDFoundry, replacePDFlinks, initEditor, registerActorMapping };
});