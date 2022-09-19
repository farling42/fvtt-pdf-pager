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

const MODULE_NAME="pdf-pager";
const FLAG_PAGE_OFFSET="pageOffset";

Hooks.once('init', () => {
    globalThis.migratePDFoundry = migratePDFoundry;
    globalThis.migratePDFlinks  = migratePDFlinks;
});

/**
 * Convert existing journal entries from PDFoundry to PDF-Pager format
 */

 async function migratePDFoundry(options={}) {
    async function migrateOne(entry, options) {
        if (options.onlyIfEmpty && entry.pages.size>0) return;  // Presumably we've already converted it
        let pdfdata = entry.flags?.pdfoundry?.PDFData;
        if (!pdfdata) return;  // There is no PDFoundry information in this page.

        await entry.createEmbeddedDocuments("JournalEntryPage", [{
            name:  pdfdata.name || entry.name,
            type:  "pdf",
            flags: { [MODULE_NAME]: { [FLAG_PAGE_OFFSET]: pdfdata.offset }},
            src:   pdfdata.url
         }]);
         console.log(`Migrated '${pdfdata.name||entry.name}' to new PDF format`);
    }

    console.log(`Starting migratePDFoundry`)
    for (const entry of game.journal) {
        await migrateOne(entry, options);
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
 * Convert all occurrences of @PDF[id]{label} to @UUID[type.id]{label}
 */

async function migratePDFlinks(options={}) {

    const pattern = /@PDF\[([^|]+)\|page=(\d*)]{([^}]+)}/g;

    async function migrateOne(entry, options) {
        entry.pages.filter(page => page.type === 'text').forEach(async (page) => {
            const text = page.text.content;
            if (!text.includes('@PDF[')) return;

            // OLD - @PDF[shortid|page=xxx]{label}
            // NEW - @UUID[longuid#page=xxx]{label}

            function getpdfpageid(entry, pagenum, label) {
                for (const page of entry.pages) {
                    if (page.type === 'pdf') {
                        return `@UUID[${page.uuid}#page=${pagenum}]{${label}}`
                    }
                }
                return undefined;
            }
            
            // Handle await not working inside replaceAll
            const promises = [];
            async function readpack(pack, id, match, pagenum, label) {
                let entry = pack.getDocument(oldid.slice(dotpos+1));
                return {match, replacement: entry ? getpdfpageid(entry) : undefined}
            }

            let newtext = text.replaceAll(pattern, (match,oldid,pagenum,label) => {
                const dotpos = oldid.lastIndexOf('.');
                let entry;
                if (dotpos>0) {
                    const compname = oldid.slice(0,dotpos-1);
                    const pack = game.packs.find(pack => pack.metadata.name === compname);
                    if (pack && !pack.locked) promises.push(readpack(pack, oldid.slice(dotpos+1), match, pagenum, label));
                    return match;
                } else {
                    entry = game.journal.get(oldid);
                    return entry ? getpdfpageid(entry, pagenum, label) : match;
                }
            });

            if (promises.length > 0) {
                const data = await Promise.all(promises);
                for (const match of data) {
                    newtext = newtext.replace(match.match, match.replacement);
                }
            }
        
            if (newtext != text) {
                page.update({"text.content": newtext});
                console.log(`Journal '${entry.name}', Page '${page.name}', replaced all @PDF`);
            }
        })
    }

    console.log(`Starting migratePDFlinks`)
    for (const entry of game.journal) {
        await migrateOne(entry, options);
    }
    for (const pack of game.packs) {
        if (pack.locked || pack.metadata.type != 'JournalEntry') continue;
        console.log(`Checking JournalEntry compendium '${pack.metadata.label}'`)
        for (const elem of pack.index) {
            await migrateOne(await pack.getDocument(elem._id), options);
        }
    }
    console.log(`Finished migratePDFlinks`)
}