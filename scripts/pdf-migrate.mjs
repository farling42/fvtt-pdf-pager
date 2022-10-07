/*
PDF-PAGER

Copyright © 2022 Martin Smith

Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
and associated documentation files (the "Software"), to deal in the Software without 
restriction, including without limitation the rights to use, copy, modify, merge, publish, 
distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or 
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

import { PDFCONFIG } from './pdf-config.mjs'

/**
 * Convert existing journal entries from PDFoundry to PDF-Pager format
 */

export async function migratePDFoundry(options={}) {
    async function migrateOne(entry, options) {
        if (options.onlyIfEmpty && entry.pages.size>0) return;  // Presumably we've already converted it
        let pdfdata = entry.flags?.pdfoundry?.PDFData;
        if (!pdfdata) return;  // There is no PDFoundry information in this page.

        await entry.createEmbeddedDocuments("JournalEntryPage", [{
            name:  pdfdata.name || entry.name,
            type:  "pdf",
            flags: { [PDFCONFIG.MODULE_NAME]: { 
                [PDFCONFIG.FLAG_OFFSET]: pdfdata.offset,
                [PDFCONFIG.FLAG_CODE]:   pdfdata.code
            }},
            src:   pdfdata.url
         }]);
         console.log(`Migrated '${pdfdata.name||entry.name}' to new PDF format`);
    }

    console.log(`Starting migratePDFoundry`)
    for (const entry of game.journal) {
        await migrateOne(entry, options);
    }
    for (const actor of game.actors) {
        if (!actor.getFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT)) {
            let pdfdata = actor.flags?.pdfoundry?.FormData;
            if (pdfdata) 
                actor.setFlag(PDFCONFIG.MODULE_NAME, PDFCONFIG.FLAG_FIELDTEXT, pdfdata);
        }
    }
    for (const pack of game.packs) {
        if (pack.locked || pack.metadata.type != 'JournalEntry') continue;
        console.log(`Checking JournalEntry compendium '${pack.metadata.label}'`)
        for (const elem of pack.index) {
            await migrateOne(await pack.getDocument(elem._id), options);
        }
    }
    console.log(`Finished migratePDFoundry`)
}

/**
 * Convert all occurrences of @PDF[source name]{label} to @UUID[type.id]{label}
 */

export async function replacePDFlinks(options={}) {

    const pattern = /@PDF\[([^|]+)\|page=(\d*)]{([^}]+)}/g;

    function migrateOne(entry, options) {
        entry.pages.filter(page => page.type === 'text').forEach( page => {
            const text = page.text.content;
            if (!text.includes('@PDF[')) return;

            // OLD - @PDF[shortid|page=xxx]{label}
            // NEW - @UUID[longuid#page=xxx]{label}

            function getpdfpageid(entry, bookname, pagenum, label) {
                // Look for a PDF page with the same name as the book.
                let thepage = entry.pages.find(entry => entry.type === 'pdf' && entry.name === bookname);
                if (!thepage) {
                   // No page with same name as book, so use the first PDF page
                    for (const page of entry.pages) {
                        if (page.type === 'pdf') {
                            thepage = page;
                            break;
                        }
                    }
                }
                return thepage ? `@UUID[${thepage.uuid}#page=${pagenum}]{${label}}` : undefined;
            }
            
            let newtext = text.replaceAll(pattern, (match,bookname,pagenum,label) => {
                const entry = game.journal.getName(bookname);
                return entry ? getpdfpageid(entry, bookname, pagenum, label) : match;
            });

            if (newtext != text) {
                page.update({"text.content": newtext});
                console.log(`Journal '${entry.name}', Page '${page.name}', replaced all @PDF`);
            }
        })
    }

    console.log(`Starting migratePDFlinks`)
    for (const entry of game.journal) {
        migrateOne(entry, options);
    }
    for (const pack of game.packs) {
        if (pack.locked || pack.metadata.type != 'JournalEntry') continue;
        console.log(`Checking JournalEntry compendium '${pack.metadata.label}'`)
        for (const elem of pack.index) {
            migrateOne(await pack.getDocument(elem._id), options);
        }
    }
    console.log(`Finished migratePDFlinks`)
}