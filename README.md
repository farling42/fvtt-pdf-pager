[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-pdf-pager)
![Foundry Info](https://img.shields.io/badge/Foundry-v10-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-pdf-pager/latest/module.zip)

# PDF Pager

This module provides the following:

- Automatically load a PDF into a page as soon as the page is displayed.
- Include "#page=xxx" as a suffix on the document link to open a PDF document at the requested page.
- Include a page offset in the PDF document definition, so that page=xxx can reference the book's page numbering (some PDFs have extra pages before page 1).
- Automatically migrates PDFoundry PDF information to new pages in journals.

## Example

```text
@UUID{JournalEntry.T29aMDmLCPYybApI.JournalEntryPage.iYV6uMnFwdgZORxi#page=10}
```

## Installation

The module is available from the Foundry Module Management window, just search for "PDF Pager", or it can be manually added with the following link:

[https://github.com/farling42/fvtt-pdf-pager/releases/latest/download/module.json]

## Migrating from PDFoundry

A function is available which can be called directly from a macro script or from the console command-line.

It takes a single optional parameter which is an object that can contain the single boolean field 'onlyIfEmpty', which if set will only migrate PDFoundry
journal entries which currently have no pages.

```js
migratePDFoundry()
```

OR

```js
migratePDFoundry({onlyIfEmpty:true})
```