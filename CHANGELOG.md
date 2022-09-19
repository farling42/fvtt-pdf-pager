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
