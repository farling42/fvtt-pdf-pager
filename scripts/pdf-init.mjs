import { openPDFByCode, openPDFByName, deleteOutlines } from './pdf-pager.mjs';
import { migratePDFoundry, replacePDFlinks } from './pdf-migrate.mjs';
import { registerActorMapping, registerItemMapping, getPDFValue, setPDFValue } from './pdf-editable.mjs';
import { configureMenuSettings } from './pdf-menu.mjs';
import { configureActorSettings } from './pdf-actorsheet.mjs';
import { configureItemSettings } from './pdf-itemsheet.mjs';
import { PDFCONFIG, SpreadMode, ScrollMode } from './pdf-config.mjs';

export let SpreadChoices, ZoomChoices, ScrollChoices;

Hooks.once('ready', () => {
    // Set up module settings
    let name = PDFCONFIG.MODULE_NAME;
    let param = PDFCONFIG.ALWAYS_LOAD_PDF;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.CREATE_PDF_LINK_ON_DROP;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.FORM_FILL_PDF;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.SHOW_TITLE_BAR_BUTTONS;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.SHOW_GM_BUTTONS;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.EDITABLE_ANNOTATIONS;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.HIDE_EDITABLE_BG;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    param = PDFCONFIG.HIDE_EDITABLE_BORDER;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    param = PDFCONFIG.NO_SPELL_CHECK;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    param = PDFCONFIG.READ_FIELDS_FROM_PDF;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    param = PDFCONFIG.AUTO_SCROLL_TOC;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.MAX_TOC_DEPTH;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Number,
        range: {
            min: 2,
            max: 6
        },
        default: 3,
        config: true
    });

    param = PDFCONFIG.HIDE_TOOLBAR;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true
    });

    param = PDFCONFIG.SHOW_MAP_TOOLTIPS;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    param = PDFCONFIG.FIELD_MAPPING_MODE;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true
    });

    param = PDFCONFIG.IGNORE_BOOKMARK_ZOOM;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        requiresReload: true,
        config: true
    });

    param = PDFCONFIG.DEFAULT_ZOOM;
    ZoomChoices = {
        "none": game.i18n.localize(`${name}.Zoom.none`),
        "page-actual": game.i18n.localize(`${name}.Zoom.page-actual`),
        "page-width": game.i18n.localize(`${name}.Zoom.page-width`),
        "page-fit": game.i18n.localize(`${name}.Zoom.page-fit`),
        "auto": game.i18n.localize(`${name}.Zoom.auto`),
        "number": game.i18n.localize(`${name}.Zoom.number`)
    };
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: String,
        choices: ZoomChoices,
        default: "none",
        config: true
    });

    param = PDFCONFIG.DEFAULT_ZOOM_NUMBER;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Number,
        default: 100,
        config: true,
        requiresReload: false
    });

    param = PDFCONFIG.DEFAULT_SPREAD;  // PDFjs: SpreadMode (ui_utils.js)
    SpreadChoices = {
        [SpreadMode.UNKNOWN]: game.i18n.localize(`${name}.Spread.none`),
        [SpreadMode.NONE]: game.i18n.localize(`${name}.Spread.no-spread`),
        [SpreadMode.ODD]: game.i18n.localize(`${name}.Spread.odd-spread`),
        [SpreadMode.EVEN]: game.i18n.localize(`${name}.Spread.even-spread`)
    };
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Number,
        choices: SpreadChoices,
        default: SpreadMode.UNKNOWN,
        config: true
    });

    param = PDFCONFIG.DEFAULT_SCROLL;  // PDFjs ScrollMode (ui_utils.js)
    ScrollChoices = {
        [ScrollMode.UNKNOWN]: game.i18n.localize(`${name}.Scroll.none`),
        [ScrollMode.VERTICAL]: game.i18n.localize(`${name}.Scroll.vertical`),
        [ScrollMode.HORIZONTAL]: game.i18n.localize(`${name}.Scroll.horizontal`),
        [ScrollMode.WRAPPED]: game.i18n.localize(`${name}.Scroll.wrapped`),
        [ScrollMode.PAGE]: game.i18n.localize(`${name}.Scroll.page`)
    };
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: Number,
        choices: ScrollChoices,
        default: ScrollMode.UNKNOWN,
        config: true
    });

    let colorhandler = game.settings;
    if (game.modules.get("color-picker")?.active)
        colorhandler = ColorPicker;

    // Clickable Text colours
    param = PDFCONFIG.LABEL_CLICKABLE_COLOR;
    colorhandler.register(name, param,
        {
            name: game.i18n.localize(`${name}.${param}.Name`),
            hint: game.i18n.localize(`${name}.${param}.Hint`),
            scope: "world",
            type: String,
            default: "#ff000020",
            config: true
        },
        {
            format: 'hexa',
            alphaChannel: true
        });

    param = PDFCONFIG.LABEL_HOVERED_COLOR;
    colorhandler.register(name, param,
        {
            name: game.i18n.localize(`${name}.${param}.Name`),
            hint: game.i18n.localize(`${name}.${param}.Hint`),
            scope: "world",
            type: String,
            default: "#0000ff40",
            config: true
        },
        {
            format: 'hexa',
            alphaChannel: true
        });

    param = PDFCONFIG.LABEL_PRESSED_COLOR;
    colorhandler.register(name, param,
        {
            name: game.i18n.localize(`${name}.${param}.Name`),
            hint: game.i18n.localize(`${name}.${param}.Hint`),
            scope: "world",
            type: String,
            default: "#0000ff80",
            config: true
        },
        {
            format: 'hexa',
            alphaChannel: true
        });

    // Ideally ACTOR_CONFIG and ITEM_CONFIG would use a TextArea.
    // We can't simply patch the SettingsConfig.prototype._renderInner to swap "<input" for "<textarea" because
    // the value is stored differently (and so would have to be retrieved in a different manner):
    // <input type="text" value="actorConfig"/>
    // <textarea name="pdf-pager.actorConfig" rows="4"> has the text between <textarea>actorConfig</textarea>
    //
    // (both would also have attributes:  name="pdf-pager.actorConfig" data-dtype="String"
    param = PDFCONFIG.ACTOR_CONFIG;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: String,
        default: "",
        config: true
    });

    param = PDFCONFIG.ITEM_CONFIG;
    game.settings.register(name, param, {
        name: game.i18n.localize(`${name}.${param}.Name`),
        hint: game.i18n.localize(`${name}.${param}.Hint`),
        scope: "world",
        type: String,
        default: "",
        config: true
    });

    configureActorSettings();
    configureItemSettings();
    configureMenuSettings();

    if (!ui.pdfpager) {
        ui.pdfpager = {
            openPDFByCode, openPDFByName, migratePDFoundry, replacePDFlinks,
            registerActorMapping, registerItemMapping, getPDFValue, setPDFValue, deleteOutlines
        };
    }
});