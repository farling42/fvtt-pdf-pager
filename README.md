[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-pdf-pager)
![Foundry Info](https://img.shields.io/badge/Foundry-v10-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-pdf-pager/latest/module.zip)


# PDF Pager

This module provides two key functions:

- the ability to automatically load a PDF into a page as soon as the page is displayed.
- the ability to include "|page=xxx" as a document link to open a PDF document at the requested page.

## Configuration

The Edit page for a Journal PDF page will include an additional entry which is a page offset, so that the "|page=xxx" parameter can reference the page number in the rulebook, even though the PDF might have other pages preceding the document's proper "Page 1".