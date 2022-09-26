## 0.11.0

- When dragging a PDF to create a `@PDF` link, if the PDF is currently being displayed then the page number on display will be put into the link (otherwise page=1 will be put into the link).

## 0.10.0

- Provide support for Form-Fillable PDFs as Journal PDF Pages which are linked to an Actor through the PDF Page's Code field.

## 0.9.0

- Provide a configuration option to automatically create a @PDF link when dropping a PDF page into another document being edited.

## 0.8.1

- Rename openPdfByCode to openPDFByCode (to maintain compatibility with PDFoundry)
- Fix syntax error in translation file.

## 0.8.0

- Move publicly accessible functions to be under ui.pdfpager.\<function>.
- Add UI notifications if openPdfByCode fails to find the relevant document.

## 0.7.1

- Fix bug with PDF code not being displayed if no page offset was present for the PDF.

## 0.7.0

- Add global function to support opening pages using shortcut code defined for a PDF, and add shortcode field to PDF editor page.

```js
openPdfByCode("PHB");
openPdfByCode("DMG", {page:10});
```

## 0.6.0

- Support encoding existing @PDF links in the same way as PDFoundry (if the link doesn't exist, then just show the label without any link box).
- Support an additional part to the @PDF name so that @PDF[journalname#pagename|page=xx] will look in the journal called 'journalname' for a page called 'pagename'

## 0.5.0

- migratePDFlinks needs to handle @PDF[bookname|page=xxx] not @PDF[docid|page=xxx]
- migratePDFlinks will look for a Journal Entry called 'bookname' (in above example). If one is found, then it will prefer to use a PDF page within that journal called 'bookname', otherwise it will use the first PDF page in that journal entry.

## 0.4.0

- Remove unused files from the manifest file.
- Move MigratePDF* functions to a separate file, to keep them isolated from the main functionality of the module.
- Fix the example link, and give a simple explanation of it.

## 0.3.0

- Add migratePDFoundry global function for users to put into a macro or run from console command-line.
- Add migratePDFlinks  global function for users to migrate the old @PDF[id|page=xx] link format to the new @UUID[uuid#page=xx] format.
- Fix size issue with the PDF Editor window containing the new "Page Offset" field.
- Add translation for the "Page Offset" settings in the PDF editor window.

## 0.2.0

- On startup, for any journal entry which has no pages, if there is PDFoundry information available on the journal entry then create a Page containing the PDF information.

## 0.1.0

- Add Page Offset to the PDF editor page, and use this page offset when determining what page number to pass to pdfjs.

## 0.0.1

- Configuration parameter to always load a PDF as soon as the page is selected in the Journal Entry - this can be configured from the module settings panel.

- Allow #page=xxx (where xxx is a number) to be appended to the UUID of a PDF document reference so that the PDF will be opened at the indicated page, e.g.

```text
@UUID{JournalEntry.T29aMDmLCPYybApI.JournalEntryPage.iYV6uMnFwdgZORxi#page=10}
```
