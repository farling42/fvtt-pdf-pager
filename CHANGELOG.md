# CHANGELOG

## 0.19.0

- If a player doesn't have OWNER rights, then fields are marked as readOnly not disabled.
- Improve the detection of changes to field values.
- When a PDF is configured to be used as the Actor sheet, do not redraw the entire window on each Actor update.

## 0.18.0

- Provide a module configuration setting to remove the light-blue background from editable fields in fillable PDFs.
- Provide basic support for managing ownership so that all editable fields are disabled if the user is not the owner of the displayed Document (a change of ownership requires manual reopening of the PDF window).

## 0.17.0

- Fix an issue with edit not working on PDFs that aren't configured with special event handling.
- Ensure that 'select' fields (drop-down menus) are initialised to their stored values.
- Only call migratePDFoundry at startup if the user is a GM.

## 0.16.2

- For the "PDF Sheet" Actor sheet, automatically migrate FormData information from PDFoundry to where it is stored with PDF Pager (assuming the same PDF is being used by both modules).

## 0.16.1

- Provide the ability to use a PDF as an Actor sheet. In the Module settings you can configure which PDF will be used for each type of Actor. The same behaviour will occur as for Journal PDF Pages for where the data is stored.

## 0.15.0

- Make a tiny change so that the Form Fillable support also works with links to Compendium entries.
- Fix bug where using a raw ID of an item in the PDF CODE would not work (but using 'Item.id' would work).
- Display UI notification warning if an Actor/Item displayed in an open PDF Page gets deleted.
- Add another optional field to openPDFByCode, specifying {pdfcode:'uuid'} will open the PDF document to show the thing referenced by id (for use with Form Fillable PDFs)
- Add an entry to the Actor and Item context menus in the Sidebar. The module settings allows you to set the 'PDF Code' to be used for each type of Actor and Item (the menu won't appear unless the corresponding document type has a PDF Code configured for it).

## 0.14.0

- Remove option to save field as hidden flags and do this automatically for any field which isn't mapped to a field on the Actor.
- Allow dragging of Actor or Item into the 'PDF Code' field of the PDF page editor.
- Allow a PDF page to be used for a specific Item (as an alternative to a specific Actor).
- README updated with information about how to access the hidden fields.
- Module Settings window hint changed to indicate that a Javascript object is being read from the Field Mappings, not a JSON object (since getValue and setValue functions can be defined in the object).
- Ensure deletion of an Actor or Item linked to a visible PDF Page is handled gracefully.

## 0.13.0

- When handling PDF input fields, use the 'id' attribute if the 'name' attribute is not defined.
- Don't listen to changes to disabled fields in PDFs.
- Detect loading of page properly, to ensure all fields are populated correctly.
- Ensure PDFs containing fields with "calculated values" have their values stored.
- Provide an Additional configuration parameter "Field Mappings from Actor" which can be used instead of calling `registerActorMapping`.
- KNOWN BUG: PDF fields which are automatically calculated by the PDF are not being calculated when the PDF page is displayed.

## 0.12.0

- Allow calculated fields to be configured for the spreadsheet. In the definition of the field define an object as the value for the object-field. The object should get a `getValue(actor)` function and an optional `setValue(actor,value)` function. If the setValue function is not present then the field will be made read-only.
- Add additional fields to the dnd5e.mjs as a testing environment (including examples of calculated fields).
- Provide a module option to store all the field information from the PDF in hidden fields on the Actor instead of updating normal Actor fields.

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
