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
import { openPDFByCode } from './pdf-pager.mjs'

const MENU_ACTOR_FLAG = "menuActorCode";
const MENU_ITEM_FLAG = "menuItemCode";

function getMapping(element) {
    if (element instanceof jQuery) element = element[0];
    const docid = element.data ? element.data("documentId") : element.dataset.entryId;
    if (element.classList.contains('actor')) {
        const uuid = `Actor.${docid}`
        const document = fromUuidSync(uuid);
        return { uuid, pdfcode: game.settings.get(PDFCONFIG.MODULE_NAME, `${MENU_ACTOR_FLAG}.${document.type}`) };
    } else if (element.classList.contains('item')) {
        const uuid = `Item.${docid}`
        const document = fromUuidSync(uuid);
        return { uuid, pdfcode: game.settings.get(PDFCONFIG.MODULE_NAME, `${MENU_ITEM_FLAG}.${document.type}`) };
    } else {
        return undefined;
    }
}


Hooks.once('init', async () => {
    function addMenu(wrapped, ...args) {
        return wrapped(...args).concat({
            name: `${PDFCONFIG.MODULE_NAME}.showInPDF`,
            icon: '<i class="fas fa-file-pdf"></i>',
            condition: (li) => {
                return getMapping(li)?.pdfcode?.length > 0;
            },
            callback: async (li) => {
                const mapping = getMapping(li);
                openPDFByCode(mapping.pdfcode, { uuid: mapping.uuid });
            },
        });
    }
    libWrapper.register(PDFCONFIG.MODULE_NAME, "foundry.applications.sidebar.tabs.ActorDirectory.prototype._getEntryContextOptions", addMenu, libWrapper.WRAPPER);
    libWrapper.register(PDFCONFIG.MODULE_NAME, "foundry.applications.sidebar.tabs.ItemDirectory.prototype._getEntryContextOptions", addMenu, libWrapper.WRAPPER);
})

export function configureMenuSettings() {
    const MODULE = PDFCONFIG.MODULE_NAME;
    // One entry for each Actor type
    for (const [type, label] of Object.entries(CONFIG.Actor.typeLabels)) {
        let actorname = game.i18n.has(label) ? game.i18n.localize(label) : type;
        game.settings.register(MODULE, `${MENU_ACTOR_FLAG}.${type}`, {
            name: game.i18n.format(`${MODULE}.actorType.Name`, { 'name': actorname }),
            hint: game.i18n.format(`${MODULE}.actorType.Hint`, { 'name': actorname }),
            scope: "world",
            type: String,
            default: "",
            config: true,
        });
    }
    // One entry for each Item type
    for (const [type, label] of Object.entries(CONFIG.Item.typeLabels)) {
        let itemname = game.i18n.has(label) ? game.i18n.localize(label) : type;
        game.settings.register(MODULE, `${MENU_ITEM_FLAG}.${type}`, {
            name: game.i18n.format(`${MODULE}.itemType.Name`, { 'name': itemname }),
            hint: game.i18n.format(`${MODULE}.itemType.Hint`, { 'name': itemname }),
            scope: "world",
            type: String,
            default: "",
            config: true
        });
    }
}

Hooks.on('renderSettingsConfig', (app, html, options) => {
    const actors = Object.entries(CONFIG.Actor.typeLabels);
    const items = Object.entries(CONFIG.Item.typeLabels);

    const moduleTab = html.querySelectorAll(`.tab[data-tab=${PDFCONFIG.MODULE_NAME}]`);

    let label = document.createElement("h4");
    label.classList.add("setting-header");
    label.innerText = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.TitleMenusActor`);
    let picker = moduleTab[0].querySelectorAll(`input[name=${PDFCONFIG.MODULE_NAME}\\.${MENU_ACTOR_FLAG}\\.${actors[0][0]}]`);
    if (picker) picker[0].closest('div.form-group').before(label);          

    label = document.createElement("h4");
    label.classList.add("setting-header");
    label.innerText = game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.TitleMenusItem`);
    picker = moduleTab[0].querySelectorAll(`input[name=${PDFCONFIG.MODULE_NAME}\\.${MENU_ITEM_FLAG}\\.${items[0][0]}]`);
    if (picker) picker[0].closest('div.form-group').before(label);          

})