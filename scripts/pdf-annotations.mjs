/*
PDF-PAGER

Copyright © 2024 Martin Smith

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

import { PDFCONFIG } from './pdf-config.mjs';

// Values for pdfPageMode
const NOT_EDITED = 0;
const IGNORE_EDIT = 1;
const HAS_LOCAL_EDITS = 2;

// Values for uimanager.updateToolbar (pdfjs: src/shared/util.js)
const AnnotationEditorType = {
  DISABLE: -1,
  NONE: 0,
  FREETEXT: 3,
  HIGHLIGHT: 9,
  STAMP: 13,
  INK: 15,
};

export async function initAnnotations(document, pdfviewerapp, editable) {

  pdfviewerapp.pdfViewer.pdfPagerMode = IGNORE_EDIT;

  // The UIManager is created very early on, and is needed for later loading of manual annotations.
  let uimanager;  // to be filled by 
  pdfviewerapp.eventBus.on('annotationeditoruimanager', ev => {
    uimanager = ev.uiManager;
    if (CONFIG.debug.pdfpager) console.debug(`annotationeditoruimanager:`, uimanager);
  })

  function getAnnotationEditors(pdfpageview, pageIndex) {
    let result = [];
    const storage = pdfpageview.annotationLayer?.annotationStorage.getAll();
    if (!storage) return result;

    // As AnnotationEditorUIManager.copy(event)
    for (const [key, editor] of Object.entries(storage)) {
      if (key.startsWith("pdfjs_internal_editor_") &&
        !editor.deleted &&
        editor.pageIndex == pageIndex) {
        result.push(editor);
      }
    }
    return result;
  }

  function removePageAnnotations(pageIndex) {
    const pdfpageview = pdfviewerapp.pdfViewer._pages[pageIndex];
    if (!pdfpageview) return;
    for (const editor of getAnnotationEditors(pdfpageview, pageIndex)) {
      editor.remove();
    }
  }

  function flagName(pageNumber) { return `flags.${PDFCONFIG.MODULE_NAME}.objects.page${pageNumber}` }

  function setPageAnnotations(pageNumber) {
    const value = foundry.utils.getProperty(document, flagName(pageNumber));
    if (!value) {
      // Allow annotationeditorstateschanged to possibly update the document's flags
      pdfviewerapp.pdfViewer.pdfPagerMode = NOT_EDITED;
      return;
    }

    if (CONFIG.debug.pdfpager) console.debug(`Loading annotations for page ${pageNumber}`)
    const pasteevent = new ClipboardEvent("copy", { clipboardData: new DataTransfer() });
    pasteevent.clipboardData.setData("application/pdfjs", value);

    // Prevent annotationeditorstateschanged from updating the document's flags
    pdfviewerapp.pdfViewer.pdfPagerMode = IGNORE_EDIT;
    uimanager.updateToolbar(AnnotationEditorType.INK);    // AnnotationEditorType.INK

    // paste() always adds them to the current page/layer
    const oldpage = uimanager.currentPageIndex + 1;
    uimanager.onPageChanging({ pageNumber })

    // As per AnnotationEditorUIManager.paste
    const data = JSON.parse(value);
    const layer = uimanager.getLayer(pageNumber - 1);
    for (const editor of data) {
      const deserializedEditor = layer.deserialize(editor);
      if (deserializedEditor) {
        // PDFJS will think that this is a paste, and so offset it based on width/height,
        // so fudge the opposite of what rebuild will do because it thinks we are doing a copy/paste.
        // PDFJS, Ink.render() doing `if (this.width) ... setAt <with offset>`
        deserializedEditor.x -= deserializedEditor.width;
        deserializedEditor.y -= deserializedEditor.height;
        uimanager.rebuild(deserializedEditor)
      }
    }

    uimanager.onPageChanging({ pageNumber: oldpage });
    uimanager.updateToolbar(AnnotationEditorType.NONE);

    // Allow annotationeditorstateschanged to possibly update the document's flags
    pdfviewerapp.pdfViewer.pdfPagerMode = NOT_EDITED;
  }

  pdfviewerapp.eventBus.on('annotationeditorlayerrendered', async event => {
    const pageNumber = event.pageNumber;
    const pdfpageview = event.source;

    // Prevent loading annotations if editor layer rendered a second time
    const editors = getAnnotationEditors(pdfpageview, pageNumber - 1);
    if (editors.length > 0) {
      if (CONFIG.debug.pdfpager) console.debug(`annotationeditorlayerrendered: already loaded annotations for page ${pageNumber} - ignoring`);
      return;
    }

    // See pdf.js : PDFViewerApplication._initializeViewerComponents
    // in else part of "annotationEditorMode !== AnnotationEditorType.DISABLE"
    const domdoc = event.source.div.ownerDocument;
    for (const id of ["editorModeButtons", "editorModeSeparator"]) {
      domdoc.getElementById(id)?.classList.toggle("hidden", !editable);
    }

    setPageAnnotations(pageNumber);
  }); // eventBus.on('annotationeditorlayerrendered')

  if (editable) {

    // Register the debounceUpdates only once
    const debounceUpdateFlags = foundry.utils.debounce(updateFlags, 250);

    function updateFlags() {
      // Save any manual annotations made to this page.
      let updates = {}

      for (const pdfpageview of pdfviewerapp.pdfViewer._pages) {
        if (!pdfpageview.pdfPage || !pdfpageview.annotationLayer) continue;  // during startup

        const editors = [];
        const pageNumber = pdfpageview.pdfPage.pageNumber;

        for (const editor of getAnnotationEditors(pdfpageview, pageNumber - 1)) {
          const serialized = editor.serialize(/*isForCopying*/ true);
          if (serialized) {
            editors.push(serialized);
          }
        }
        const value = editors.length ? JSON.stringify(editors) : "";

        // setFlag without re-rendering
        const flag = flagName(pageNumber);
        const oldvalue = foundry.utils.getProperty(document, flag);

        if (oldvalue != value) {
          if (CONFIG.debug.pdfpager) console.debug(`annotationeditorstateschanged: page ${pageNumber} = ${editors.length} annotations (${value.length} bytes)`);
          foundry.utils.setProperty(updates, flag, value);
        }
      }

      if (Object.keys(updates).length) document.update(updates, { render: false, updatePdfEditors: true });
      pdfviewerapp.pdfViewer.pdfPagerMode = NOT_EDITED;
    }

    pdfviewerapp.eventBus.on('annotationeditorstateschanged', async ev => {

      // Don't update the flags if the user hasn't performed any edits yet.
      if (pdfviewerapp.pdfViewer.pdfPagerMode == IGNORE_EDIT) return;

      if (ev.details.isEditing) {
        if (CONFIG.debug.pdfpager) console.debug(`annotationeditorstateschanged: local editing has been detected`)
        pdfviewerapp.pdfViewer.pdfPagerMode = HAS_LOCAL_EDITS;
        return;
      } else if (pdfviewerapp.pdfViewer.pdfPagerMode != HAS_LOCAL_EDITS) {
        if (CONFIG.debug.pdfpager) console.debug(`annotationeditorstateschanged: no local edit performed yet`)
        return;
      }

      // The event is generated once, and lists only the currently displayed PDF page.
      // It doesn't account for changes made on other pages of the PDF page,
      // so we have to iterate over all the pages to see which contain actual changes.
      debounceUpdateFlags();

    }) // eventBus.on('annotationeditorstateschanged')
  } // if (editable)

  function updateAnnotations(document, changed, options, userId) {
    if (options.updatePdfEditors && game.userId != userId && changed?.flags?.[PDFCONFIG.MODULE_NAME]?.objects) {
      if (CONFIG.debug.pdfpager) console.debug('updateAnnotations', { document, changed, options, userId });

      // Just reload the annotations in the affected page
      const sheet = document.parent?.sheet ?? document.sheet;
      if (!sheet || !sheet.rendered) return;

      let changedPages = Object.keys(changed?.flags?.[PDFCONFIG.MODULE_NAME]?.objects ?? {});
      let changes = changedPages.map(key => parseInt(key.slice(4)));  // strip leading "page" from "pageXX"

      for (const pageNumber of changes) {
        removePageAnnotations(pageNumber - 1);
        setPageAnnotations(pageNumber);
      }
    }
  }

  Hooks.on('updateJournalEntryPage', updateAnnotations);
  Hooks.on('updateActor', updateAnnotations);
  Hooks.on('updateItem', updateAnnotations);

} // function initAnnotations

/**
 * When initEditor isn't being used (because editing of form-fillable PDFs is disabled),
 * this function will initialize annotation editing separately.
 * @param {*} html 
 * @param {*} id_to_display 
 * @returns 
 */
export async function setupAnnotations(html, id_to_display) {

  const document = (id_to_display.includes('.') && await fromUuid(id_to_display)) || game.actors.get(id_to_display) || game.items.get(id_to_display);
  if (!document) return;

  html.on('load', async (event) => {

    // Wait for PDF to initialise before attaching to event bus.
    const pdfviewerapp = event.target.contentWindow.PDFViewerApplication;
    await pdfviewerapp.initializedPromise;
    
    initAnnotations(document, pdfviewerapp, /*editable*/ document.canUserModify(game.user, "update"));
  })

}