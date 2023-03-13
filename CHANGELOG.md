# CHANGELOG

## 0.39.1

- Fix the detection of the PDF scripting manager being ready. The old version worked fine when running with a local server, but always failed when running on a remote server.

## 0.39.0

- When using Fillable PDFs as Actor sheets, remember the current size of the Actor Sheet on a Foundry reload/restart. (The default Foundry behaviour is that the window size is remembered during a game session, but it isn't saved between restarts of Foundry.)

## 0.38.1

- Add fr translations, provided by @Gabryel666

## 0.38.0

- Provide an option to disable the browser's spell checker within editable fields of a PDF.
- Apply the Zoom Level module option to Actor sheets as well as journal entries.

## 0.37.0

- Provide a new option 'Hide Editable Field Border" which will remove the box around editable fields. This complements the support already provided by the 'Hide Editable Field BG" setting.
- Ensure that only annotations of the Widget type are used for fillable PDFs.

## 0.36.3

- Restore the functionality of the "Inspect Data" button in the Actor title bar.

## 0.36.2

- Fix constant reloading of a PDF if the PDF page was initially created without this plugin, and the PDF has no outline defined within it.

## 0.36.1

- If a page from an open journal PDF is dragged onto the canvas, then the default PDF Page Number for the note will be set to the currently visible page in the PDF window. (Note that Foundry V10 does not allow linking to sections within a document.)

## 0.36.0

- Provide an additional field in the Note Config window to allow a PDF page to be specified for each scene Note.

## 0.35.0

- Add a new 'Log PDF Fields' which will send the list of PDF field names to the browser's console, to aid in setting up custom field mappings. Each field name is followed by the field type defined in the PDF (e.g. "Tx" for Text, "Btn" for a check button).

## 0.34.2

- If the PDF contains complex rules, then the changes to a value were not stored immediately on the Actor - it required the field to be selected again before the new value would get saved.

## 0.34.1

- Allow buttons in Actor Sheet title bar to be translated.
- Update German translation, with many thanks to @CePeU

## 0.34.0

- Provide an optional default zoom parameter which will be used when opening all PDFs (available in the module settings window).
- Remove temporary patch for bug in core Foundry V10, since 10.290 contains the required fixes.
- Add translations for text in the Actor sheet's Choose PDF dialog.
- Ensure 'Hide Editable Field BG' works when 'Read Fields from PDF' is enabled.
- When "Read Fields From PDF" is enabled, then don't register any listeners on the PDF.

## 0.33.1

- Fix syntax issue in main code, and in new macro.

## 0.33

- Remove the temporary styles that were added to make PDF pages fit vertically in the window, since this is available in Foundry V10.290
- Do not automatically invoke migratePDFoundry at startup, to avoid GMs reading ALL the journal compendiums at startup.
- Provide a Macro in a compendium called "Migrate PDFoundry" to allow GMs to manually invoke the migration without requiring any scripting knowledge.

## 0.32.1

- Fix an issue with enrichHTML if it is called without a second argument (the optional `options`)

## 0.32.0

- Add a simple CSS file that ensures that PDF pages are shown full length within the window.

## 0.31.0

- Allow pdfcode to be used as an alternative to supplying the journal name and page name in `@PDF[pdfcode]{label}` or `@PDF[pdfcode|page=x]{label}`
- `ui.pdfpager.openPDFByCode` optimised so that when a specific page is requested, if the PDF is already open then it simply moves that displayed document to the requested page.

## 0.30.0

- Calculate PDF's table of contents as soon as possible after loading the PDF document.
- Add German translations, submitted by `CePeU`.
- Use System-provided translations for Actor and Item types if available (note that CoC7 does not use the standard translation keys).
- BUG FIX: Clicking on link when wrong page in journal was displayed didn't show the correct PDF.
- BUG FIX: Ensure selected page/heading is displayed when TOC doesn't already exist on the PDF.

## 0.29.2

- Don't try to calculate TOC if not owner of the underlying document.
- Prevent error when clicking on the page in the Nav Pane when no TOC present.
- Only let GM call `ui.pdfpager.deleteOutlines()`

## 0.29.1

- Document the availability of the function `ui.pdfpager.deleteOutlines()` to delete all stored Outlines for PDFs in the Journal sidebar.
- BUG FIX: Ensure that TOC entries with the same text have different slugs (using `JournalEntryPage._flattenTOC`)
- BUG FIX: Ensure that `@PDF` links are created with `journal#page` if the page name is different from the journal name.
- BUG FIX: Ensure that dragging a PDF section title to another journal entry creates the correct `@PDF` slug.
- BUG FIX: When a PDF is not currently displayed, clicking on a link will open the PDF at the correct position.

## 0.29.0

- Change to PDF section links using the slug name of the section, rather than a complicated PDF Outline entry.

## 0.28.1

- Ensure options.anchor is a string before using it (Monk's Active Tiles sets anchor to an array, for its own purposes)

## 0.28.0

- Create TOC in the Journal Sheet from the Outline (if any) stored within each PDF.
- Dragging a page heading from the TOC to create a link will add "|page=x" as before.
- Dragging a section heading from the TOC to create a link will create a slug in the link which will open the PDF at that specific section.
- If a PDF is already open, then clicking on a link will move the already open PDF to the correct location instead of reloading the PDF.

## 0.27.0

- Ensure that when checking for `@PDF` anchors, that we search all journals with the matching journal name.
- Reduce the delay between a PDF opening and setting up the fillable fields.
- Revamp the README to make it easier to understand the module.

## 0.26.0

- Add two new functions to assist module/macro developers in accessing PDF field values.  `ui.pdfpager.getPDFValue(actor,fieldname)` will return the value stored for the named field.  `ui.pdfpager.setPDFValue(actor,fieldname,value)` will set the named field to the specified value (string).

## 0.25.0

- Support PDFs which have pre-computed fields.  There is a slight delay after opening an Actor PDF sheet before the fields are displayed, so that the PDF scripting engine will be fully initialised.

## 0.24.0

- If no explicit mapping is given for a PDF field, then see if the "name" of the PDF field matches a field in the Actor/Item being edited. This should add support for PDFs which were generated for use with PDFoundry.
- Do not use the "id" of a PDF field as the key for hiding the value on the Actor/Item (Adding data to a PDF outside of Foundry and then saving the filled PDF changes the ID of the fields!)
- Provide the "Inspect Data" button and window from [PDFoundry](https://github.com/Djphoenix719/PDFoundry)

## 0.23.0

- When a generic PDF has been configured for a particular type of Actor, opening an Actor's sheet will present an additional button in the title bar "Custom PDF". Selecting this button will let you configure a specific PDF to be used for this particular Actor, superceding the generic PDF configured in the module settings. Deleting the specific PDF from this window will restore the Actor sheet to the generic PDF configured in the module settings. The user has to close the window and reopen it for the new PDF to be shown.

## 0.22.0

- Only present the "PDF Sheet" option in the Sheet Configuration window if a PDF has been defined in the module settings for that type of actor.
- Move the SHEET settings above the MENUS settings in the module configuration window.

## 0.21.0

- Rework how fillable data is handled with PDFs (since the old method didn't work for PDFs with no JSActions).
- Support radio buttons in PDF documents (using the "buttonValue" of the PDF field as the value to be stored).

## 0.20.1

- Fix an issue where the PDF configured to use with an Actor sheet might be a web address instead of a file local to the Foundry userdata area.

## 0.20.0

- Provide a new module configuration option, "Read Fields from PDF". When enabled, on loading a PDF file into a window then all the values currently stored in that PDF file will be transferred to the associated Actor/Item. Editing in the PDF window is disabled while the option is enabled, to ensure that the user is aware that this is a temporary state to quickly get PDF settings into Foundry.

## 0.19.1

- Fix problem when SWADE tries to call TextEditor.enrichHTML with source that is not a string.

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
