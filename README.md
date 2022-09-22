[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-pdf-pager)
![Foundry Info](https://img.shields.io/badge/Foundry-v10-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-pdf-pager/latest/module.zip)

# PDF Pager

This module provides the following:

- Configuration option to automatically load a PDF into a page as soon as the page is displayed.
- Include "#page=xxx" as a suffix on the document link to open a PDF document at the requested page.
- Include a page offset in the PDF document definition, so that page=xxx can reference the book's page numbering (some PDFs have extra pages before page 1).
- Supports the existing @PDF[name]{label}   but the page name must have the same name as the journal.
- Provide additional syntax of @PDF[journalname#pagename|page=xx]{label} to allow PDFs to be displayed in a page whose name does not match the journal name.
- Automatically migrates PDFoundry PDF information to new pages in journals.

## Example

Showing a link to an existing PDF page within a journal entry, and specifying that the link will open the PDF at page 10:

```text
@UUID[JournalEntry.T29aMDmLCPYybApI.JournalEntryPage.iYV6uMnFwdgZORxi#page=10]{label}
@PDF[name|page=xxx]{label}            <note that the journal and page must both match the single 'name'>
@PDF[journalname#pagename|page=xxx]{label}
```

## Installation

The module is available from the Foundry Module Management window, just search for "PDF Pager", or it can be manually added with the following link:

https://github.com/farling42/fvtt-pdf-pager/releases/latest/download/module.json

## Utility Function

A new function is available for modules to use which will open a PDF using a short-code defined for that specific PDF (e.g. "DMG" or "PHB"), optionally specifying a specific page number to open, such as:

```js
ui.pdfpager.openPdfByCode("PHB")
ui.pdfpager.openPdfByCode("DMG", {page:30})
```

## Migrating from PDFoundry

Function are available which can be called directly from a macro script or from the console command-line to migrate your existing PDFoundry documents and links to the new format.

### migratePDFoundry()

This function creates a page in each journal entry containing the information previously configured using PDFoundry for each PDF.

It takes a single optional parameter which is an object that can contain the single boolean field 'onlyIfEmpty', which if set will only migrate PDFoundry journal entries which currently have no pages.

```js
ui.pdfpager.migratePDFoundry()
```

OR

```js
ui.pdfpager.migratePDFoundry({onlyIfEmpty:true})
```

The second version is triggered automatically on starting the game (or enabling the module).

### replacePDFlinks

If you no longer want to have `@PDF[name]` links in your documents, a function is provided to convert them to the Foundry V10 standard format of `@UUID[longuuid]` format.

The new link will be to a Journal Entry called "bookname" (see OLD syntax below), and one of the PDF pages inside that journal entry: either a PDF page called "bookname" otherwise the first PDF page in that journal entry.

OLD: @PDF[bookname|page=xxx]{label}

NEW: @UUID[full-uid-to-pdf-page#page=xxx]{label}

```js
ui.pdfpager.replacePDFlinks()
```
