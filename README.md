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

```
@UUID{JournalEntry.T29aMDmLCPYybApI.JournalEntryPage.iYV6uMnFwdgZORxi#page=10}
```