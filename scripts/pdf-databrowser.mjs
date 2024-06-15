/*
 * Copyright 2021 Andrew Cuccinello
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * From PDFoundry @ https://github.com/Djphoenix719/PDFoundry
 */
/*
 * PDF-Pager changes Copyright 2022 Martin Smith
*/
import { PDFCONFIG } from './pdf-config.mjs';

/**
 * Basic app to allow the user to see data keys for actor/item sheets
 * @internal
 */
export class PDFDataBrowser extends Application {
    // doc = actor or item
    constructor(doc, options) {
        super(options);
        this.doc = doc;
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = `modules/${PDFCONFIG.MODULE_NAME}/templates/data-browser.hbs`;
        options.width = 600;
        options.height = 400;
        options.resizable = true;
        return options;
    }
    get title() {
        return `${this.doc.name}`;
    }
    _getHeaderButtons() {
        const buttons = super._getHeaderButtons();
        buttons.unshift({
            class: 'pdf-sheet-refresh',
            icon: 'fas fa-sync',
            label: 'Refresh',
            onclick: () => this.render(),
        });
        return buttons;
    }
    getData(options) {
        const data = super.getData(options);
        let DangerLevel;
        let baseclass;
        (function (DangerLevel) {
            DangerLevel[DangerLevel["Safe"] = 0] = "Safe";
            DangerLevel[DangerLevel["Low"] = 1] = "Low";
            DangerLevel[DangerLevel["High"] = 2] = "High";
            DangerLevel[DangerLevel["Critical"] = 3] = "Critical";
        })(DangerLevel || (DangerLevel = {}));
        const flattenStack = new Set();
        window['actorData'] = this.doc.system;
        const flatten = (data, current = '', danger = DangerLevel.Safe) => {
            let results = [];
            const path = (curr, ...next) => {
                if (curr.length > 0) {
                    for (let i = 0; i < next.length; i++) {
                        curr = `${curr}.${next[i]}`;
                    }
                    return curr;
                }
                else {
                    return `${next}`;
                }
            };
            const wrap = (value) => {
                return `\{\{${value}\}\}`;
            };
            const boundDanger = (curr, next) => {
                if (curr < next) {
                    return next;
                }
                return curr;
            };
            if (data === null)
                return results;
            if (data === undefined)
                return results;
            if (typeof data === 'object') {
                if (data instanceof baseclass) {   // data instanceof Actor/Item
                    console.warn('Embedded Actor found in data, excluding the embedded Actor from the list of fields')
                    return results;
                }
                if (flattenStack.has(data)) {
                    console.warn('Nested Embedded Object found in data, excluding the embedded Object from the list of fields', data)
                    return results;
                }
                flattenStack.add(data);

                for (const [key, value] of Object.entries(data)) {
                    if (Array.isArray(value)) {
                        // Case 1 : The value is an array
                        if (value.length === 0) {
                            results.push({
                                key: path(current, key),
                                danger: DangerLevel.Critical,
                                value: wrap('Empty Array, do not use!'),
                            });
                        }
                        else {
                            for (let i = 0; i < value.length; i++) {
                                const next = value[i];
                                results = [...results, ...flatten(next, path(current, key, i), boundDanger(danger, DangerLevel.High))];
                            }
                        }
                    }
                    else if (value === null || value === undefined) {
                        results.push({
                            key: path(current, key),
                            danger: DangerLevel.High,
                            value: wrap('Null/Undefined, be cautious!'),
                        });
                    }
                    else if (typeof value === 'object') {
                        // Case 2 : The value is an object
                        if (foundry.utils.isEmpty(value)) {
                            results.push({
                                key: path(current, key),
                                danger: DangerLevel.Critical,
                                value: wrap('Empty Object, do not use!'),
                            });
                        }
                        else {
                            for (let [key2, value2] of Object.entries(value)) {
                                results = [...results, ...flatten(value2, path(current, key, key2), boundDanger(danger, DangerLevel.Low))];
                            }
                        }
                    }
                    else if (typeof value === 'function') {
                        // Case 3 : Base Case : The value is a function
                        results.push({
                            key: path(current, key),
                            danger: boundDanger(danger, DangerLevel.Critical),
                            value: wrap('Function, do not use!'),
                        });
                    }
                    else {
                        // Case 4 : Base Case : The value is a primitive
                        results.push({
                            key: path(current, key),
                            danger: boundDanger(danger, DangerLevel.Safe),
                            value: value.toString(),
                        });
                    }
                } // for
                flattenStack.delete(data);
            }
            else if (typeof data === 'function') {
                // Case 3 : Base Case : The value is a function
                results.push({
                    key: current,
                    danger: boundDanger(danger, DangerLevel.Critical),
                    value: wrap('Function, do not use!'),
                });
            }
            else {
                // Case 4 : Base Case : The value is a primitive
                results.push({
                    key: current,
                    danger: boundDanger(danger, DangerLevel.Safe),
                    value: data,
                });
            }
            return results;
        };
        const icons = {
            [DangerLevel.Safe]: '<i class="fas fa-check-circle"></i>',
            [DangerLevel.Low]: '<i class="fas fa-question-circle"></i>',
            [DangerLevel.High]: '<i class="fas fa-exclamation-triangle"></i>',
            [DangerLevel.Critical]: '<i class="fas fa-radiation-alt"></i>',
        };
        const tooltips = {
            [DangerLevel.Safe]: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.inspector.DANGER.Safe`),
            [DangerLevel.Low]: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.inspector.DANGER.Low`),
            [DangerLevel.High]: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.inspector.DANGER.High`),
            [DangerLevel.Critical]: game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.inspector.DANGER.Critical`),
        };
        baseclass = (this.doc instanceof Actor) ? Actor : Item;
        data['paths'] = flatten(this.doc.system, 'system');
        data['paths'].push({
            key: 'name',
            value: this.doc.name,
            danger: DangerLevel.Safe,
        });
        data['paths'].sort((a, b) => a.key.localeCompare(b.key));
        data['paths'] = data['paths'].map((element) => {
            let splitRoll = element['key'].split('.');
            splitRoll.shift();
            return {
                ...element,
                icon: icons[element.danger],
                roll: `@${splitRoll.join('.')}`,
                tooltip: tooltips[element.danger],
            };
        });
        return data;
    }
    activateListeners(html) {
        super.activateListeners(html);
        html.find('i.copy').on('click', async (event) => {
            const target = $(event.currentTarget);
            await navigator.clipboard.writeText(target.data('value'));
            ui.notifications.info(game.i18n.localize(`${PDFCONFIG.MODULE_NAME}.inspector.CopiedToClipboard`));
        });
    }
    render(force, options) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(this.render.bind(this), 10000);
        return super.render(force, options);
    }
    close() {
        clearTimeout(this.timeout);
        return super.close();
    }
}