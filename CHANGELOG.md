# CHANGELOG

## 1.2.1

- Ensure the annotation tools are enabled when opening a PDF which contains no current annotations.

## 1.2.0

- Provide option to set SPREAD separately for each Journal Page, which will override the general module setting.

## 1.1.6

- Hide annotation tools by default (in case the option is disabled in the pdf-pager module settings).
- Ensure that annotations can be edited and saved when "Support Form-Fillable PDFs" is disabled.

## 1.1.5

- Hide the annotation editors if the user does not have OWNER permission on the PDF (i.e. the user has read-only permission).

## 1.1.4

- Fixes an issue where a PDF defined with a "PDF Code" did not allow annotations to be saved.

## 1.1.3

- Remove OPEN, DOWNLOAD and PRINT options in PDF.JS (to match Foundry's functionality).

## 1.1.2

- Remove the call to validateFileURL in viewer.mjs of pdfjs. This should allow PDFs to be loaded on Forge VTT.

## 1.1.1

- Use legacy-dist version of pdfjs, so that it works on Foundry V10+ (and older browsers).
- Reduce download size by removing the *.mjs.map files from the pdfjs/build folder.
- Use `game.release.generation` instead of `isNewerVersion`

## 1.1.0

- Use own packaged version of PDFJS (4.4.168), since Foundry removes the Print, Save, Ink and Text functionality in their shipped version.
- Add the ability to use the PDF.JS annotation tools to draw lines and write text on top of the PDF (both Journal PDF pages and Actor/Item sheets). The annotations are stored inside the JournalEntryPage document that also contains the PDF. Changes are only saved when the relevant editor is DEselected from the toolbar. Changes are immediately synced with other players who have that PDF open for display.

## 0.53.4

- Ensure that the standard enricher method is used on Foundry V12 for converting `@PDF` links to HTML (since it is always async in V12).
- Bump verified version to 12.328

## 0.53.3

- Ensure that the original actor/item is added to the list of objects which should prevent recursion.
- Only create the list of fields once in the PDF window's DOM, and have all input fields reference that single datalist.
- Add array elements to the list of available fields in the field editor.
- Only output editor debugging when `CONFIG.debug.pdfpager=true`

## 0.53.2

- Prevent error about exceeding JS stack when editing PDF fields or using the data field inspector (Primarily an issue with the data structures in Foundry V12 for dnd5e and pf2e).
- Update to reference foundry.utils.isEmpty
- Update verified to 12.327.

## 0.53.1

- Provide the correct sorting of duplicated numerical headers, as implemented in Foundry V12 (the fix only works in V12).
- Update 'verified' to '12.325'

## 0.53.0

- Update `verified` version to `12.324` to indicate it supports Foundry V12 (as well as the existing V10 and V11).

## 0.52.8

- Fix an issue that broke OmniSearch where no TOC has been created for a PDF page.

## 0.52.7

- A better (proper) solution for allowing fields to be deleted.

## 0.52.6

- Fix a bug so that the value in a field can be deleted (leaving an empty field).

## 0.52.5

- Fix an issue with the "Inspect Data" window with dnd5e game system, so that it doesn't try to keep rendering the inspect data when it fails.
- Allow an editable field in the PDF to be marked with `<<<Ignore This Field>>>` so that the field's value is not stored as part of the document's settings. (This is useful for those PDFs which have internally calculated values, but those fields have not been set to disabled within the PDF.)
- Fix an issue with saved values for select fields aren't triggering the PDF's internal auto-calculations.

## 0.52.4

- Latest German translations from @CePeU

## 0.52.3

- Remove deprecation warnings on Foundry V12.318 (Development 1)

## 0.52.2

- Provide a solution for loading endlessly that works when two owners have the same PDF Actor sheet open.

## 0.52.1

- Fixes an issue where the Call of Cthulhu fillable character sheet would load endlessly when first opened.

## 0.52.0

- The event sequence that was being used to copy fields from Foundry to a fillable PDF don't work with pdf.js version 4.0.x. A better sequence has been developed which works properly for older and newer pdf.js versions.
- Switch to using DOCUMENT_OWNERSHIP_LEVELS since DOCUMENT_PERMISSION_LEVELS doesn't exist in V12 (it has been deprecated for a while).
- Changed to use foundry.utils.set/getProperty (added to foundry in V10 or earlier, and required for V12).
- A couple of one-line code tidy-ups.

## 0.51.3

- Change the event generation when copying Foundry values into an editable PDF so that they work on pdf.js version 4.0 as well as earlier.

## 0.51.2

- Change DOCUMENT_PERMISSION_LEVELS to DOCUMENT_OWNERSHIP_LEVELS (a requirement for Foundry V12).

## 0.51.1

- Replace all uses of setProperty/getProperty with their corresponding functions foundry.utils.setProperty/getProperty (they became available in V10, and are required in V12).

## 0.51.0

- With Monk's Enhanced Journal module, support creation of `@PDF` links when dragging a PDF page title to a journal page.

## 0.50.0

- Only display "Data Inspector" and "Show PDF Fields" in the Actor/Item PDF sheet if the user is a GM.
- Provide option to hide all the extra buttons in the Actor/Item PDF sheet title bar.

## 0.49.1

- Prevent error being reported when annotations can't be found on the pdfPage.
- Add basic support for clicking on buttons (if anyone is able to create a clickable button in a PDF editor).

## 0.49.0

- Allow editing of a PDF that is stored directly in a journal page.

## 0.48.2

- Update German translations, provided by @CePeU

## 0.48.1

- Prevent an error occurring if a field is defined by an object rather than as a simple string.
- Change how field values are sent to pdfjs so that they are available for printing (ctrl-P) and saving (ctrl-S).

## 0.48.0

- Add basic support for displaying the Actor's image in the sheet. This requires mapping the PDF documents data-element-id/data-annotation-id of the corresponding field to the "img" field on the Actor. (The PDFs I've examined don't include a name for this field.) The image has to be set from the default Actor sheet at this time.
- A minor update to set PDFActorSheet.getData to async, to work with game systems which have an async getData function in their ActorSheet subclass.
- Fix mapping of dnd5e DEXmod field name.

## 0.47.0

- Support accessing items within a document, using a field value something like `items[type=spell,system.level=2][3].name` (which takes all the items which have a `type` that matches `spell` and a field `system.level` which matches the value "2"; the found entries are then sorted alphabetically by name; then index `[3]` into the final sorted list will be examined for it's name field). If the given index does not exist in the found entries, then no value will be put into the PDF field. (See `systems/dnd5e.mjs` for an example where the items array is accessed).
- Update `systems/dnd5e.mjs` to use a full mapping of spell names (and `prepared` for level 1 spells) of the `5E_CharacterSheet_Fillable.pdf` sheet.
- Change field mapping editor to use autocomplete text fields, so that the new items syntax can be entered rather than only allowing a known Actor/Item field to be selected.

## 0.46.1

- Get JournalEntryPage#toc working properly for PDF pages.
- When clicking on a scene Note, don't replace an anchor with a PDF page number (The assumption is that the 'Journal Anchor Links' module is already providing a slug anchor.)

## 0.46.0

- Provide a module option 'Edit Field Mapping' which will replace all PDF fields with a drop-down menu allowing the GM to modify the mapping between PDF field and Actor/Item fields.
- Provide a module option 'Show Mapping Tooltips' which will add a tooltip to each field in a PDF used in an Actor/Item sheet giving the name of the PDF field as well as the name of the field on the Actor/Item to which it is mapped. (The tooltip will simply identify gett/setter functions without showing the code of the function).

## 0.45.1

- Ensure that PDF field names with "." in them are handled properly.

## 0.45.0

- Provide an option (default true) to hide the PDF viewer toolbar when opening a PDF for editing (e.g. in Actor and Item sheets).

## 0.44.0

- Provide the same level of support for Item sheets as is available for Actor sheets (setting a default PDF to be used, and allowing a custom PDF for each individual item).
- Allow the getValue() helper function in the Field Mappings to be async (e.g. to allow other async functions).

## 0.43.2

- Put in the correct location for the style.css file

## 0.43.1

- Only show buttons in Actor title bar if the user is an OWNER of the actor.
- Don't allow the Actor window to open if the user has only LIMITED access to the actor.

## 0.43.0

- Add a module setting to allow the maximum TOC nesting to be changed from the Foundry default of 2 for PDF pages only.

## 0.42.0

- Add module settings to set default Scroll and Page modes for PDFs.

## 0.41.2

- Change the way that the Actor PDF sheet is registered so that it works with the Simple World Building system on Foundry V11.
- Add translation key for the name of 'PDF Sheet'.

## 0.41.1

- Mark as compatible with Foundry 11 (299)

## 0.41.0

- Add a separate module option which allows a user to always ignore the zoom setting within a PDF's bookmarks (previously the zoom was only ignored if "Default Zoom" was set to something other than "None").
- Improve pattern matching for `@PDF` links, and fix error generated when `@PDF[docid]{label}` is clicked.

## 0.40.0

- If an explicit zoom is set in the module's settings, then this will override the zoom in a destination embedded in the PDF (it won't override an "array" type of bookmark defined inside the PDF).
- Changing the explicit zoom module setting will now prompt to reload Foundry, to ensure that the new setting is honoured.

## 0.39.5

- Add a file of Actor fields mappings for cyphersystem (for "Cypher System Character Sheets-Revised-FormFillable-2019-09-10.pdf")
- Section links would fail if the PDF's outline uses a destination array instead of a named destination (such as the CoC rulebook), so allow these to work by NOT setting the default zoom.

## 0.39.4

- Fix an issue where a link to a section was not opening at the correct section if an explicit preferred Zoom has been set in the PDF Pager module settings.
- Don't prompt for game reload after changing preferred zoom.

## 0.39.3

- The "Inspect Data" window now checks to see if an embedded object is an Actor, and won't display any of the fields of that Actor. This fixes a lock-up that would occur when using the Inspect Data button with the "Generic Roleplaying Game Aid" system.

## 0.39.2

- Change how the 'Log PDF Fields' button decides which PDF to actually read when generating the list of fields (and include an UI warning if no PDF was found).
- Optimise the code so that a local cache of document-to-PDFviewer mapping is no longer required.

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
