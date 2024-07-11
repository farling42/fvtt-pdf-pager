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

export async function initAnnotations(document, pdfviewerapp, editable) {

  // The UIManager is created very early on, and is needed for later loading of manual annotations.
  let uimanager;  // to be filled by 
  pdfviewerapp.eventBus.on('annotationeditoruimanager', ev => {
    console.log(`annotationeditoruimanager:`, ev);
    uimanager = ev.uiManager;
  })

  function getAnnotationEditors(pdfpageview, pageIndex) {
    let result = [];
    const storage = pdfpageview.annotationLayer.annotationStorage.getAll();
    if (storage) {
      // As AnnotationbEditorUIManager.copy(event)
      for (const [k, v] of Object.entries(storage)) {
        //console.log(`${k}`, v);
        if (k.startsWith("pdfjs_internal_editor_") &&
          !v.deleted &&
          v.pageIndex == pageIndex) {
          result.push(v);
        }
      }
    }
    return result;
  }

  function removePageAnnotations(pageNumber) {
    const pageIndex = pageNumber - 1;
    const pdfpageview = pdfviewerapp.pdfViewer._pages[pageIndex];
    const storage = pdfpageview.annotationLayer.annotationStorage.getAll();
    if (!storage) return;

    for (const [key, editor] of Object.entries(storage)) {
      //console.log(`${k}`, v);
      if (key.startsWith("pdfjs_internal_editor_") &&
        !editor.deleted &&
        editor.pageIndex == pageIndex) {
        console.log(`Removing editor ${key} from page ${pageNumber}`);
        editor.remove();
      }
    }
  }

  function flagName(pageNumber) { return `flags.${PDFCONFIG.MODULE_NAME}.objects.page${pageNumber}` }

  function setPageAnnotations(pageNumber) {
    const value = foundry.utils.getProperty(document, flagName(pageNumber));
    if (!value) return;

    console.log(`Loading annotations for page ${pageNumber}`)
    const pasteevent = new ClipboardEvent("copy", { clipboardData: new DataTransfer() });
    pasteevent.clipboardData.setData("application/pdfjs", value);
    uimanager.updateToolbar(15);

    // paste() always adds them to the current page/layer
    // Position is OFFSET each time that the PDF is opened.
    const oldpage = uimanager.currentPageIndex + 1;
    uimanager.onPageChanging({ pageNumber })
    /*
    // maybe rebuild(editor)?
    // AnnotationEditorLayer.deserialize()
    // AnnotationEditorLayer.addorrebuild(editor)
    for (const editor in JSON.parse(value)) {
      const layer = pdfviewerapp.pdfViewer._pages[ev.source.pageNumber-1].annotationEditorLayer;
      layer.addOrRebuild(event.source.getLayer(layer).deserialize(editor))
    }
      */
    // Make sure we do NOT allow undo
    uimanager.paste(pasteevent);
    uimanager.onPageChanging({ pageNumber: oldpage });
    uimanager.updateToolbar(0);
  }


  pdfviewerapp.eventBus.on('annotationeditorlayerrendered', async event => {
    // event:
    //   source: PDFPageView
    //   pageNumber: Integer
    //   error: null
    //console.log('annotationeditorlayerrendered', event)

    const pageNumber = event.pageNumber;

    // Prevent loading annotations if editor layer rendered a second time
    const pdfpageview = event.source; // pdfviewerapp.pdfViewer._pages[pageNumber - 1];
    const editors = getAnnotationEditors(pdfpageview, pageNumber - 1);
    if (editors.length > 0) {
      console.log(`annotationeditorlayerrendered: already loaded annotations for page ${pageNumber} - ignoring`);
      return;
    }

    setPageAnnotations(pageNumber);
  }); // eventBus.on('annotationeditorlayerrendered')

  if (editable) {
    pdfviewerapp.eventBus.on('annotationeditorstateschanged', async ev => {
      // Save any manual annotations made to this page.
      //console.log(`annotationeditorstateschanged for page index ${ev.source.currentPageIndex} to ${JSON.stringify(ev.details)}`)

      if (ev.details.isEditing) return;
      const pdfpageview = pdfviewerapp.pdfViewer._pages[ev.source.currentPageIndex];

      const editors = [];
      const pageNumber = pdfpageview.pdfPage.pageNumber;

      for (const editor of getAnnotationEditors(pdfpageview, ev.source.currentPageIndex)) {
        const serialized = editor.serialize(/*isForCopying*/ true);
        if (serialized) editors.push(serialized);
      }
      const value = editors.length ? JSON.stringify(editors) : "";
      console.log(`annotationeditorstateschanged: page ${pageNumber} = ${editors.length} annotations (${value.length} bytes)`);

      // setFlag without re-rendering
      const flag = flagName(pageNumber);
      const oldvalue = foundry.utils.getProperty(document, flag);

      if (oldvalue != value) {
        document.update({ [flag]: value }, { render: false, updatePdfEditors: true });
      } else
        console.log('flag value unchanged');
    }) // eventBus.on('annotationeditorstateschanged')

    pdfviewerapp.eventBus.on('switchannotationeditormode', ev => {
      //console.log(`switchannotationeditormode: ${ev.mode}`);
    })
  } // if (editable)


  Hooks.on('updateJournalEntryPage', (document, changed, options, userId) => {
    if (document.type === "pdf" && options.updatePdfEditors && game.userId != userId && changed?.flags?.[PDFCONFIG.MODULE_NAME]?.objects) {
      console.log('updateJournalEntryPage', { document, changed, options, userId });

      // Just reload the annotations in the affected page
      const sheet = document.parent?.sheet;
      if (!sheet || !sheet.rendered) return;

      let changedPages = Object.keys(changed?.flags?.[PDFCONFIG.MODULE_NAME]?.objects ?? {});
      let changes = changedPages.map(key => parseInt(key.slice(4)));  // strip leading "page" from "pageXX"

      console.log('pages changed', changes);

      for (const pageNumber of changes) {
        removePageAnnotations(pageNumber);
        setPageAnnotations(pageNumber);
      }
    }
  })

} // function initAnnotations


