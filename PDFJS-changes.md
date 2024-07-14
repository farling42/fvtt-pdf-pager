# Implemtnation Notes for the local version of PDF.JS

- Use the `legacy-dist` distribution, so that it supports Foundry 10+ and non-latest browsers.
- In web/viewer.js, comment out the call to validateFileURL

## Core Foundry versions

dist (not legacy-dist) version of the following:

- Foundry V10 uses pdfjs-2.14.305-1
- Foundry V11 uses pdfjs-3.4.120-dist
- Foundry V12 uses pdfjs-4.0.379-1

## Core Foundry changes

### All versions

- Removes validateFileURL function and the call to it.

### Foundry V10 (PDF.JS 2.14.305)

- In **SecondaryToolbar** remove options.printButton, options.downloadButton
- In **Toolbar** remove options.print, options.download

### Foundry V11 (PDF.JS 3.4.120)

- In **SecondaryToolbar** remove options.printButton, options.downloadButton, options.openFileButton
- In **Toolbar** remove options.print, options.download, options.openFile

### Foundry V12 (PDF.JS 4.0.379)

- In **webViewerKeyDown** remove section for (cmd === 1 || cmd === 8)  _(1=download, 2=openfile)_
- Remove **keydown** handler in **PDFPrintService**
- In **SecondaryToolbar** remove options.printButton, options.downloadButton, options.openFileButton
- In **Toolbar** remove options.print, options.download, **options.editorFreeTextButton, options.editorInkButton, options.editorStampButton**, options.openFile
- In **Toolbar.#editorModeChanged** remove editorFreeTextButton, editorFreeTextParamsToolbar, editorInkButton, editorInkParamsToolbar, editorStampButton, editorStampParamsToolbar