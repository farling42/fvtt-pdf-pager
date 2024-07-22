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

import { openPDFByCode, deleteOutlines } from './pdf-pager.mjs';
import { migratePDFoundry, replacePDFlinks } from './pdf-migrate.mjs';
import { registerActorMapping, registerItemMapping, getPDFValue, setPDFValue } from './pdf-editable.mjs';
import { configureMenuSettings } from './pdf-menu.mjs';
import { configureActorSettings } from './pdf-actorsheet.mjs';
import { configureItemSettings } from './pdf-itemsheet.mjs';

export let PDFCONFIG = {
  MODULE_NAME: "pdf-pager",
  // World config flags
  ALWAYS_LOAD_PDF: "alwaysLoadPdf",
  CREATE_PDF_LINK_ON_DROP: "dropPdfLink",
  FORM_FILL_PDF: "formFillPdf",
  ACTOR_CONFIG: "actorConfig",
  ITEM_CONFIG: "itemConfig",
  HIDE_EDITABLE_BG: "hideFieldBg",
  HIDE_EDITABLE_BORDER: "hideFieldBorder",
  READ_FIELDS_FROM_PDF: "readPdfFields",
  EDITABLE_ANNOTATIONS: "editableAnnotations",
  DEFAULT_ZOOM: "defaultZoom",
  DEFAULT_ZOOM_NUMBER: "zoomPercentage",
  DEFAULT_SPREAD: "defaultSpread",
  DEFAULT_SCROLL: "defaultScroll",
  NO_SPELL_CHECK: "noSpellCheck",
  IGNORE_BOOKMARK_ZOOM: "ignoreBookmarkZoom",
  MAX_TOC_DEPTH: "maxTocDepth",
  HIDE_TOOLBAR: "hideToolbar",
  SHOW_MAP_TOOLTIPS: "showMapTooltips",
  FIELD_MAPPING_MODE: "showFieldMenus",
  SHOW_TITLE_BAR_BUTTONS: "showTitleBarButtons",
  // Flags on an Actor
  FLAG_OFFSET: "pageOffset",
  FLAG_CODE: "code",
  FLAG_FIELDTEXT: "fieldText",
  FLAG_CUSTOM_PDF: "customPDF",
  FLAG_TOC: "toc",
  FLAG_WINDOW_SIZE: "windowSize",
  FLAG_SPREAD: "spread",
  // Flags on Note
  PIN_PDF_PAGE: "pdfPage"
};

// PDFjs: web/ui_utils.js
export const SpreadMode = {
  UNKNOWN: -1,
  NONE: 0, // Default value.
  ODD: 1,
  EVEN: 2,
};

// PDFjs: ui_utils.js
export const ScrollMode = {
  UNKNOWN: -1,
  VERTICAL: 0, // Default value.
  HORIZONTAL: 1,
  WRAPPED: 2,
  PAGE: 3,
};

export let SpreadChoices, ZoomChoices, ScrollChoices;

Hooks.once('ready', () => {
  // Set up module settings
  let name = PDFCONFIG.MODULE_NAME;
  let param = PDFCONFIG.ALWAYS_LOAD_PDF;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  param = PDFCONFIG.CREATE_PDF_LINK_ON_DROP;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  param = PDFCONFIG.FORM_FILL_PDF;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  param = PDFCONFIG.SHOW_TITLE_BAR_BUTTONS;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  param = PDFCONFIG.EDITABLE_ANNOTATIONS;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  param = PDFCONFIG.HIDE_EDITABLE_BG;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  param = PDFCONFIG.HIDE_EDITABLE_BORDER;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  param = PDFCONFIG.NO_SPELL_CHECK;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  param = PDFCONFIG.READ_FIELDS_FROM_PDF;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  param = PDFCONFIG.MAX_TOC_DEPTH;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Number,
    range: {
      min: 2,
      max: 6
    },
    default: 3,
    config: true
  });

  param = PDFCONFIG.HIDE_TOOLBAR;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  param = PDFCONFIG.SHOW_MAP_TOOLTIPS;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  param = PDFCONFIG.FIELD_MAPPING_MODE;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  param = PDFCONFIG.IGNORE_BOOKMARK_ZOOM;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Boolean,
    default: false,
    requiresReload: true,
    config: true
  });

  param = PDFCONFIG.DEFAULT_ZOOM;
  ZoomChoices = {
    "none": game.i18n.localize(`${name}.Zoom.none`),
    "page-actual": game.i18n.localize(`${name}.Zoom.page-actual`),
    "page-width": game.i18n.localize(`${name}.Zoom.page-width`),
    "page-fit": game.i18n.localize(`${name}.Zoom.page-fit`),
    "auto": game.i18n.localize(`${name}.Zoom.auto`),
    "number": game.i18n.localize(`${name}.Zoom.number`)
  };
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: String,
    choices: ZoomChoices,
    default: "none",
    config: true
  });

  param = PDFCONFIG.DEFAULT_ZOOM_NUMBER;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Number,
    default: 100,
    config: true,
    requiresReload: false
  });

  param = PDFCONFIG.DEFAULT_SPREAD;  // PDFjs: SpreadMode (ui_utils.js)
  SpreadChoices = {
    [SpreadMode.UNKNOWN]: game.i18n.localize(`${name}.Spread.none`),
    [SpreadMode.NONE]: game.i18n.localize(`${name}.Spread.no-spread`),
    [SpreadMode.ODD]: game.i18n.localize(`${name}.Spread.odd-spread`),
    [SpreadMode.EVEN]: game.i18n.localize(`${name}.Spread.even-spread`)
  };
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Number,
    choices: SpreadChoices,
    default: SpreadMode.UNKNOWN,
    config: true
  });

  param = PDFCONFIG.DEFAULT_SCROLL;  // PDFjs ScrollMode (ui_utils.js)
  ScrollChoices = {
    [ScrollMode.UNKNOWN]: game.i18n.localize(`${name}.Scroll.none`),
    [ScrollMode.VERTICAL]: game.i18n.localize(`${name}.Scroll.vertical`),
    [ScrollMode.HORIZONTAL]: game.i18n.localize(`${name}.Scroll.horizontal`),
    [ScrollMode.WRAPPED]: game.i18n.localize(`${name}.Scroll.wrapped`),
    [ScrollMode.PAGE]: game.i18n.localize(`${name}.Scroll.page`)
  };
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: Number,
    choices: ScrollChoices,
    default: ScrollMode.UNKNOWN,
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
    type: String,
    default: "",
    config: true
  });

  param = PDFCONFIG.ITEM_CONFIG;
  game.settings.register(name, param, {
    name: game.i18n.localize(`${name}.${param}.Name`),
    hint: game.i18n.localize(`${name}.${param}.Hint`),
    scope: "world",
    type: String,
    default: "",
    config: true
  });

  configureActorSettings();
  configureItemSettings();
  configureMenuSettings();

  if (!ui.pdfpager) {
    ui.pdfpager = {
      openPDFByCode, migratePDFoundry, replacePDFlinks,
      registerActorMapping, registerItemMapping, getPDFValue, setPDFValue, deleteOutlines
    };
  }
});