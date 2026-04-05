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
    SHOW_GM_BUTTONS: "showGmButtons",
    AUTO_SCROLL_TOC: "autoScrollToc",
    LABEL_CLICKABLE_COLOR: "labelClickableColor",
    LABEL_HOVERED_COLOR: "labelHoverColor",
    LABEL_PRESSED_COLOR: "labelClickColor",
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