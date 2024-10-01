class pf2e_btneq {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
  getValue(actor) {
    const value = foundry.utils.getProperty(actor, this.field);
    return value == this.value;
  }
}
class pf2e_btnge {
  constructor(field, value) {
    this.field = field;
    this.value = value;
  }
  getValue(actor) {
    const value = foundry.utils.getProperty(actor, this.field);
    return value >= this.value;
  }
}
class pf2e_prof {
  constructor(field) {
    this.field = field;
  }
  getValue(actor) {
    const value = foundry.utils.getProperty(actor, this.field);
    return `${value ? (2 * value + actor.system.details.level.value) : 0}`;
  }
}
class pf2e_modifier{
  constructor(field, type) {
    this.field = field;
    this.type  = type;
  }
  getValue(actor) {
    const value = foundry.utils.getProperty(actor, this.field);
    const modifier = value.find(e => e.enabled && (e.type === this.type || e.slug === this.type));
    return `${modifier ? modifier.modifier : 0}`;
  }
}

export let actormap = {
  "textarea_1mgbu": "name", // Name
  "textarea_2fdvi":  { getValue(actor) { return "Tx" }},  // Player Name
  "textarea_3ovje": "system.details.xp.value",  // XP
  "textarea_4pzs":  "system.details.level.value",  // level
  "checkbox_5xofc": new pf2e_btnge("heroPoints.value", 1), // hero1
  "checkbox_6hrfm": new pf2e_btnge("heroPoints.value", 2), // hero2
  "checkbox_7kodx": new pf2e_btnge("heroPoints.value", 3), // hero3
  "textarea_8vvvf": "class.name",      // Class
  "textarea_9hqub": "background.name", // Background
  "textarea_10wvlg": "system.details.ancestry.name",  // Ancestry
  "textarea_11xkjd": "system.details.heritage.name", // Heritage and Traits
  "textarea_13zexb": "Tx", // Background Notes
  "textarea_14dsra": "Tx", // Class Notes
  "text_15gujr": "system.abilities.str.mod", // STR
  "text_16qanz": "system.abilities.dex.mod", // DEX
  "text_17gvzw": "system.abilities.con.mod", // CON
  "text_18pyog": "size", // Size
  "text_19oxfl": "system.abilities.int.mod", // INT
  "text_20ziso": "system.abilities.wis.mod", // WIS
  "text_21kkgc": "system.abilities.cha.mod", // CHA
  "text_22orsf": "hitPoints.max", // Max HP
  "checkbox_23wguq": new pf2e_btneq("saves.will.rank", 1), // Will Save T
  "checkbox_24vupa": new pf2e_btneq("saves.will.rank", 2), // Will Save E
  "checkbox_25itkc": new pf2e_btneq("saves.will.rank", 3), // Will Save M
  "checkbox_26pidm": new pf2e_btneq("saves.will.rank", 4), // Will Save L
  "checkbox_27hggm": new pf2e_btneq("saves.reflex.rank", 1), // Ref Save T
  "checkbox_28genn": new pf2e_btneq("saves.reflex.rank", 2), // Ref Save E
  "checkbox_29rnjq": new pf2e_btneq("saves.reflex.rank", 3), // Ref Save M
  "checkbox_30mata": new pf2e_btneq("saves.reflex.rank", 4), // Ref Save L
  "checkbox_31nubu": new pf2e_btneq("saves.fortitude.rank", 1), // Fort Save T
  "checkbox_32kxvm": new pf2e_btneq("saves.fortitude.rank", 2), // Fort Save E
  "checkbox_33rqu":  new pf2e_btneq("saves.fortitude.rank", 3),  // Fort Save M
  "checkbox_34zbhl": new pf2e_btneq("saves.fortitude.rank", 4), // Fort Save L
  "text_35baby": "system.shield.hardness", // Shield Hardness
  "text_36ccwn": "system.shield.hp.max",   // Shield Max HP
  "text_37jfu":  "system.shield.brokenThreshold", // Shield BT
  "text_38yxhc": "system.shield.hp.value", // Shield HP
  "text_39mwlp": "system.shield.ac", // AC shield
  "text_40dugs": "armorClass.value",  // AC total
  "text_41cauv": new pf2e_modifier("armorClass.modifiers", "ability"), // DEX bonus to AC
  "text_42sekz": new pf2e_modifier("armorClass.modifiers", "proficiency"), // PROF bonus to AC
  "text_43tmuz": new pf2e_modifier("armorClass.modifiers", "item"), // Item bonus to AC
  "checkbox_44scmk": "Btn", // STR partial boost
  "checkbox_45rhlv": "Btn", // DEX partial boost
  "checkbox_46nqfi": "Btn", // CON partial boost
  "checkbox_47lxic": "Btn", // INT partial boost
  "checkbox_48ivsd": "Btn", // WIS partial boost
  "checkbox_49vspn": "Btn", // CHA partial boost
  "textarea_50jdlf": "hitPoints.value",  // Current HP
  "text_51ziym": "hitPoints.temp", // Temp HP
  "text_52sffw": "system.attributes.wounded.value", // Wounded level
  "checkbox_53oyeq": new pf2e_btneq("system.attributes.dying.value", 1), // Dying 1
  "checkbox_54kmmt": new pf2e_btneq("system.attributes.dying.value", 2), // Dying 2
  "checkbox_55aeec": new pf2e_btneq("system.attributes.dying.value", 3), // Dying 3
  "checkbox_56vjlu": new pf2e_btneq("system.attributes.dying.value", 4), // Dying 4
  "text_57tnsn": new pf2e_modifier("saves.fortitude.modifiers", "ability"),     // FORT CON bonus
  "text_58injx": new pf2e_modifier("saves.fortitude.modifiers", "proficiency"), // FORT prof
  "text_59cdbw": "Tx", // FORT item
  "text_60dldn": new pf2e_modifier("saves.reflex.modifiers", "ability"),     // REF DEX bonus
  "text_61ejsr": new pf2e_modifier("saves.reflex.modifiers", "proficiency"), // REF prof
  "text_62xfzn": "Tx", // REF item
  "text_63lmfl": new pf2e_modifier("saves.will.modifiers", "ability"),     // WILL WIS bonus
  "text_64fgfg": new pf2e_modifier("saves.will.modifiers", "proficiency"), // WILL prof
  "text_65tgvv": "Tx", // WILL item
  "text_66qbaz": "saves.fortitude.mod", // FORT save
  "text_67mrij": "saves.reflex.mod", // REFLEX save
  "text_68jgip": "saves.will.mod", // WILL save
  "checkbox_69kbwv": new pf2e_btneq("system.proficiencies.defenses.heavy.rank", 1), // Armor Prof: Heavy T
  "checkbox_70aqce": new pf2e_btneq("system.proficiencies.defenses.heavy.rank", 2), // Armor Prof: Heavy E
  "checkbox_71vjy":  new pf2e_btneq("system.proficiencies.defenses.heavy.rank", 3), // Armor Prof: Heavy M
  "checkbox_72ub":   new pf2e_btneq("system.proficiencies.defenses.heavy.rank", 4), // Armor Prof: Heavy L
  "checkbox_73ntxl": new pf2e_btneq("system.proficiencies.defenses.medium.rank", 1), // Armor Prof: Medium T
  "checkbox_74iuay": new pf2e_btneq("system.proficiencies.defenses.medium.rank", 2), // Armor Prof: Medium E
  "checkbox_75smam": new pf2e_btneq("system.proficiencies.defenses.medium.rank", 3), // Armor Prof: Medium M
  "checkbox_76ddq":  new pf2e_btneq("system.proficiencies.defenses.medium.rank", 4), // Armor Prof: Medium L
  "checkbox_77aekt": new pf2e_btneq("system.proficiencies.defenses.light.rank", 1), // Armor Prof: Light T
  "checkbox_78yugv": new pf2e_btneq("system.proficiencies.defenses.light.rank", 2), // Armor Prof: Light E
  "checkbox_79osmb": new pf2e_btneq("system.proficiencies.defenses.light.rank", 3), // Armor Prof: Light M
  "checkbox_80xfou": new pf2e_btneq("system.proficiencies.defenses.light.rank", 4), // Armor Prof: Light L
  "checkbox_81ifhe": new pf2e_btneq("system.proficiencies.defenses.unarmored.rank", 1), // Armor Prof: Unarmored T
  "checkbox_82jzus": new pf2e_btneq("system.proficiencies.defenses.unarmored.rank", 2), // Armor Prof: Unarmored E
  "checkbox_83tbtz": new pf2e_btneq("system.proficiencies.defenses.unarmored.rank", 3), // Armor Prof: Unarmored M
  "checkbox_84alhq": new pf2e_btneq("system.proficiencies.defenses.unarmored.rank", 4), // Armor Prof: Unarmored L
  "textarea_85chme": "Tx",  // Defenses Notes
  "textarea_86oxoo": { getValue(actor) { return actor.system.attributes.resistances.map(c => c.name).concat(actor.system.attributes.immunities.map(c => c.name)).join() }},  // Resistance & Immunities
  "textarea_87nkni": { getValue(actor) { return actor.conditions.map(c => c.name).join() }},  // Conditions
  "textarea_88pngh": "Tx",  // Languages
  "text_89fwcj": new pf2e_modifier("perception.modifiers", "ability"), // Perception WIS bonus
  "text_90nhda": new pf2e_modifier("perception.modifiers", "proficiency"), // Perception Prof Bonus
  "text_91skpg": new pf2e_modifier("perception.modifiers", "item"), // Perception Item Bonus
  "text_92cge":  "system.attributes.speed.value", // Speed
  "text_93soao": "perception.mod", // Perception Score
  "checkbox_94iccy": new pf2e_btneq("perception.rank", 1), // Perception Prof T
  "checkbox_95psap": new pf2e_btneq("perception.rank", 2), // Perception Prof E
  "checkbox_96zwyo": new pf2e_btneq("perception.rank", 3), // Perception Prof M
  "checkbox_97dmxm": new pf2e_btneq("perception.rank", 4), // Perception Prof L
  "textarea_98nqed": "Tx", // Senses and Notes
  "textarea_99qcfn": { getValue(actor) { return actor.system.attributes.speed.otherSpeeds.map(c => c.breakdown).join() }}, // Special Movement
  "textarea_100weee": "Tx", // Skill Notes
  "text_101elkf": "_itemTypes.weapon.0.name", // Weapon1 name
  "text_102hko":  "_itemTypes.weapon.1.name", // Weapon2 name
  "text_103iqhr": "_itemTypes.weapon.2.name", // Weapon3 name
  "text_104osck": "_itemTypes.weapon.3.name", // Weapon4 name
  "text_105zorp": "_itemTypes.weapon.4.name", // Weapon5 name
  "text_106kl": "Tx",   // Weapon1 Traits and Notes
  "text_107zudg": "Tx", // Weapon2 Traits and Notes
  "text_108wvva": "Tx", // Weapon3 Traits and Notes
  "text_109zkrr": "Tx", // Weapon4 Traits and Notes
  "text_110kfmo": "Tx", // Weapon5 Traits and Notes
  "textarea_111ifcv": "Tx", // Weapon Proficiencies
  "textarea_112wpuz": "Tx", // Critical Specialisations
  "text_114guht": "Tx", // Weapon1 str bonus
  "text_115cekl": "Tx", // Weapon1 prof bonus
  "text_116hgnh": "Tx", // Weapon1 item bonus
  "text_117lino": "Tx", // Weapon2 str bonus
  "text_118xvhm": "Tx", // Weapon2 prof bonus
  "text_119hjtz": "Tx", // Weapon2 item bonus
  "text_120nfgn": "Tx", // Weapon3 str bonus
  "text_121krf":  "Tx", // Weapon3 prof bonus
  "text_122qefv": "Tx", // Weapon3 item bonus
  "text_123fgvx": "Tx", // Weapon4 str bonus
  "text_124boin": "Tx", // Weapon4 prof bonus
  "text_125klxi": "Tx", // Weapon4 item bonus
  "text_126diuu": "Tx", // Weapon5 str bonus
  "text_127cptg": "Tx", // Weapon5 prof bonus
  "text_128eza":  "Tx", // Weapon5 item bonus
  "text_129myfs": new pf2e_modifier("classDC.modifiers", "ability"), // class DC key
  "text_130ifxl": new pf2e_modifier("classDC.modifiers", "proficiency"), // class DC prof bonus
  "text_131yqxz": new pf2e_modifier("classDC.modifiers", "item"), // class DC item bonus
  "text_132fjev": new pf2e_modifier("skills.acrobatics.modifiers", "ability"), // Acrobatics DEX bonus
  "text_133lgl":  new pf2e_modifier("skills.acrobatics.modifiers", "proficiency"), // Acrobatics Prof bonus
  "text_134zleo": new pf2e_modifier("skills.acrobatics.modifiers", "item"), // Acrobatics Item bonus
  "text_135vtls": new pf2e_modifier("skills.acrobatics.modifiers", "armor-check-penalty"), // Acrobatics Armor penalty
  "text_136xoeq": new pf2e_modifier("skills.arcana.modifiers", "ability"), // Arcana INT bonus
  "text_137alfu": new pf2e_modifier("skills.arcana.modifiers", "proficiency"), // Arcane prof bonus
  "text_138unhe": new pf2e_modifier("skills.arcana.modifiers", "item"), // Arcane item bonus
  "text_139zqex": new pf2e_modifier("skills.athletics.modifiers", "ability"), // Athletics STR bonus
  "text_140bvdu": new pf2e_modifier("skills.athletics.modifiers", "proficiency"), // Athletics prof bonus
  "text_141pqiy": new pf2e_modifier("skills.athletics.modifiers", "item"), // Athletics item bonus
  "text_142ejye": new pf2e_modifier("skills.athletics.modifiers", "armor-check-penalty"), // Athletics armor bonus
  "text_143bfbo": new pf2e_modifier("skills.crafting.modifiers", "ability"), // Crafting INT bonus
  "text_144edbk": new pf2e_modifier("skills.crafting.modifiers", "proficiency"), // Crafting prof bonus
  "text_145coye": new pf2e_modifier("skills.crafting.modifiers", "item"), // Crafting item bonus
  "text_146nold": new pf2e_modifier("skills.deception.modifiers", "ability"), // Deception CHA
  "text_147ekvl": new pf2e_modifier("skills.deception.modifiers", "proficiency"), // Deceptoin prof
  "text_148dduu": new pf2e_modifier("skills.deception.modifiers", "item"), // Deception item
  "text_149dvo":  new pf2e_modifier("skills.diplomacy.modifiers", "ability"), // Diplomacy CHA
  "text_150fobz": new pf2e_modifier("skills.diplomacy.modifiers", "proficiency"), // Diplomacy prof
  "text_151xcas": new pf2e_modifier("skills.diplomacy.modifiers", "item"), // Diplomacy item
  "text_152yzxc": new pf2e_modifier("skills.intimidation.modifiers", "ability"), // Intimidation CHA
  "text_153gibm": new pf2e_modifier("skills.intimidation.modifiers", "proficiency"), // Intimidation prof
  "text_154shtd": new pf2e_modifier("skills.intimidation.modifiers", "item"), // Intimidation item
  "text_155pcuy": "Tx", // Lore1 INT
  "text_156bedf": "Tx", // Lore1 prof
  "text_157lvyn": "Tx", // Lore1 item
  "text_158mnfd": "Tx", // Lore2 INT
  "text_159pjpk": "Tx", // Lore2 prof
  "text_160fwnt": "Tx", // Lore2 item
  "text_161kopr": new pf2e_modifier("skills.medicine.modifiers", "ability"), // Medicine WIS
  "text_162kakl": new pf2e_modifier("skills.medicine.modifiers", "proficiency"), // Medicine prof
  "text_163els":  new pf2e_modifier("skills.medicine.modifiers", "item"), // Medicine item
  "text_164elvp": new pf2e_modifier("skills.nature.modifiers", "ability"), // Nature WIS
  "text_165leru": new pf2e_modifier("skills.nature.modifiers", "proficiency"), // Nature prof
  "text_166cpld": new pf2e_modifier("skills.nature.modifiers", "item"), // Nature item
  "text_167sj":   new pf2e_modifier("skills.occultism.modifiers", "ability"), // Occultism INT
  "text_168qbmf": new pf2e_modifier("skills.occultism.modifiers", "proficiency"), // Occultism prof
  "text_169rkty": new pf2e_modifier("skills.occultism.modifiers", "item"), // Occultism item
  "text_170lbzo": new pf2e_modifier("skills.performance.modifiers", "ability"), // Performance CHA
  "text_171srjb": new pf2e_modifier("skills.performance.modifiers", "proficiency"), // Performance prof
  "text_172jkpz": new pf2e_modifier("skills.performance.modifiers", "item"), // Performance item
  "text_173kryq": new pf2e_modifier("skills.religion.modifiers", "ability"), // Religion WIS
  "text_174lrcs": new pf2e_modifier("skills.religion.modifiers", "proficiency"), // Religion prof
  "text_175kwuc": new pf2e_modifier("skills.religion.modifiers", "item"), // Religion item
  "text_176jdwb": new pf2e_modifier("skills.society.modifiers", "ability"), // Society INT
  "text_177zjeg": new pf2e_modifier("skills.society.modifiers", "proficiency"), // Society prof
  "text_178wpfa": new pf2e_modifier("skills.society.modifiers", "item"), // Society item
  "text_179uyco": new pf2e_modifier("skills.stealth.modifiers", "ability"), // Stealth DEX
  "text_180zhdd": new pf2e_modifier("skills.stealth.modifiers", "proficiency"), // Stealth prof
  "text_181aqlp": new pf2e_modifier("skills.stealth.modifiers", "item"), // Stealth item
  "text_182zupt": new pf2e_modifier("skills.stealth.modifiers", "armor-check-penalty"), // Stealth armor
  "text_183clrx": new pf2e_modifier("skills.survival.modifiers", "ability"), // Survival WIS
  "text_184kwvv": new pf2e_modifier("skills.survival.modifiers", "proficiency"), // Survival prof
  "text_185kvqt": new pf2e_modifier("skills.survival.modifiers", "item"), // Survival item
  "text_186vyku": new pf2e_modifier("skills.thievery.modifiers", "ability"), // Thievery DEX
  "text_187ixwx": new pf2e_modifier("skills.thievery.modifiers", "proficiency"), // Thievery prof
  "text_188qfmm": new pf2e_modifier("skills.thievery.modifiers", "item"), // Thievery item
  "text_189nkbr": new pf2e_modifier("skills.thievery.modifiers", "armor-check-penalty"), // Thievery armor
  "text_190vbte": "Tx", // Lore1 Name
  "text_191iigy": "Tx", // Lore2 Name
  "text_192jvhi": "skills.acrobatics.mod", // Acrobatics Score
  "text_193ikjc": "skills.arcana.mod", // Arcana Score
  "text_194mwvr": "skills.athletics.mod", // Athletics Score
  "text_195ukwq": "skills.crafting.mod", // Crafting Score
  "text_196jtxz": "skills.deception.mod", // Deception Score
  "text_197wyik": "skills.diplomacy.mod", // Diplomacy Score
  "text_198hbtt": "skills.intimidation.mod", // Intimidation Score
  "text_199ugjw": "Tx", // Lore1 Score
  "text_200nt":   "Tx", // Lore2 Score
  "text_201aqqy": "skills.medicine.mod", // Medicine Score
  "text_202nauo": "skills.nature.mod", // Nature Score
  "text_203cxsk": "skills.occultism.mod", // Occultism Score
  "text_204gfhw": "skills.performance.mod", // Performance Score
  "text_205ezoj": "skills.religion.mod", // Religion Score
  "text_206bwbb": "skills.society.mod", // Society Score
  "text_207jpx":  "skills.stealth.mod", // Stealth Score
  "text_208acfs": "skills.survival.mod", // Survival Score
  "text_209ocmn": "skills.thievery.mod", // Thievery Score
  "text_210xwkf": "Tx", // Weapon1 damage
  "text_211daev": "Tx", // Weapon2 damage
  "text_212bnvi": "Tx", // Weapon3 damage
  "text_213ibpm": "Tx", // Weapon4 damage
  "text_214ffgh": "Tx", // Weapon5 damage
  "text_215bufl": "classDC.mod", // Class DC
  "text_216bfjs": "Tx", // Weapon1 attack
  "text_217vkoh": "Tx", // Weapon2 attack
  "text_218ktn":  "Tx", // Weapon3 attack
  "text_219fgjb": "Tx", // Weapon4 attack
  "text_220mepi": "Tx", // Weapon5 attack
  "checkbox_221acaw": "Btn", // Weapon1 damage B
  "checkbox_222higa": "Btn", // Weapon1 damage P
  "checkbox_223soyd": "Btn", // Weapon1 damage S
  "checkbox_224eime": "Btn", // Weapon2 damage B
  "checkbox_225sinv": "Btn", // Weapon2 damage P
  "checkbox_226lgus": "Btn", // Weapon2 damage S
  "checkbox_227qymn": "Btn", // Weapon3 damage B
  "checkbox_228oefh": "Btn", // Weapon3 damage P
  "checkbox_229vhvi": "Btn", // Weapon3 damage S
  "checkbox_230beak": "Btn", // Weapon4 damage B
  "checkbox_231itlz": "Btn", // Weapon4 damage P
  "checkbox_232wuou": "Btn", // Weapon4 damage S
  "checkbox_233ahkn": "Btn", // Weapon5 damage B
  "checkbox_234mfbj": "Btn", // Weapon5 damage P
  "checkbox_235vlpy": "Btn", // Weapon5 damage S
  "checkbox_236ruuj": new pf2e_btneq("system.proficiencies.attacks.unarmed.rank", 1), // Weapon Unarmed T
  "checkbox_237ftki": new pf2e_btneq("system.proficiencies.attacks.unarmed.rank", 2), // Weapon Unarmed E
  "checkbox_238imqe": new pf2e_btneq("system.proficiencies.attacks.unarmed.rank", 3), // Weapon Unarmed M
  "checkbox_239dxvo": new pf2e_btneq("system.proficiencies.attacks.unarmed.rank", 4), // Weapon Unarmed L
  "checkbox_240vjwp": new pf2e_btneq("system.proficiencies.attacks.simple.rank",  1), // Weapon Simple T 
  "checkbox_241pypb": new pf2e_btneq("system.proficiencies.attacks.simple.rank",  2), // Weapon Simple E
  "checkbox_242bjzh": new pf2e_btneq("system.proficiencies.attacks.simple.rank",  3), // Weapon Simple M
  "checkbox_243zlqn": new pf2e_btneq("system.proficiencies.attacks.simple.rank",  4), // Weapon Simple L
  "checkbox_244hsye": new pf2e_btneq("system.proficiencies.attacks.martial.rank", 1), // Weapon Martial T
  "checkbox_245ktxc": new pf2e_btneq("system.proficiencies.attacks.martial.rank", 2), // Weapon Martial E
  "checkbox_246xxrh": new pf2e_btneq("system.proficiencies.attacks.martial.rank", 3), // Weapon Martial M
  "checkbox_247pbnm": new pf2e_btneq("system.proficiencies.attacks.martial.rank", 4), // Weapon Martial L
  "checkbox_248qcfe": new pf2e_btneq("system.proficiencies.attacks.advanced.rank", 1), // Weapon Advanced T
  "checkbox_249tqec": new pf2e_btneq("system.proficiencies.attacks.advanced.rank", 2), // Weapon Advanced E
  "checkbox_250bate": new pf2e_btneq("system.proficiencies.attacks.advanced.rank", 3), // Weapon Advanced M
  "checkbox_251whzs": new pf2e_btneq("system.proficiencies.attacks.advanced.rank", 4), // Weapon Advanced L
  "checkbox_252lxty": "Btn", // Weapon Other T
  "checkbox_253vtvt": "Btn", // Weapon Other E
  "checkbox_254qzrs": "Btn", // Weapon Other M
  "checkbox_255drpy": "Btn", // Weapon Other L
  "checkbox_256jvkx": new pf2e_btneq("skills.acrobatics.rank", 1), // Acrobatics Prof T
  "checkbox_257gmjm": new pf2e_btneq("skills.acrobatics.rank", 2), // Acrobatics Prof E
  "checkbox_258xxkb": new pf2e_btneq("skills.acrobatics.rank", 3), // Acrobatics Prof M
  "checkbox_259jndm": new pf2e_btneq("skills.acrobatics.rank", 4), // Acrobatics Prof L
  "checkbox_260iaod": new pf2e_btneq("skills.arcana.rank", 1), // Arcana T
  "checkbox_261atgn": new pf2e_btneq("skills.arcana.rank", 2), // Arcana E
  "checkbox_262umrs": new pf2e_btneq("skills.arcana.rank", 3), // Arcana M
  "checkbox_263arvz": new pf2e_btneq("skills.arcana.rank", 4), // Arcana L
  "checkbox_264ospc": new pf2e_btneq("skills.athletics.rank", 1), // Athletics T
  "checkbox_265bnjw": new pf2e_btneq("skills.athletics.rank", 2), // Athletics E
  "checkbox_266wbpc": new pf2e_btneq("skills.athletics.rank", 3), // Athletics M
  "checkbox_267qfwh": new pf2e_btneq("skills.athletics.rank", 4), // Athletics L
  "checkbox_268pyqw": new pf2e_btneq("skills.crafting.rank", 1), // Crafting T
  "checkbox_269gtmq": new pf2e_btneq("skills.crafting.rank", 2), // Crafting E
  "checkbox_270jdwc": new pf2e_btneq("skills.crafting.rank", 3), // Crafting M
  "checkbox_271rhso": new pf2e_btneq("skills.crafting.rank", 4), // Crafting L
  "checkbox_272pejf": "Btn", // 
  "checkbox_273vzx":  new pf2e_btneq("skills.deception.rank", 2), // Deception E
  "checkbox_274ogyw": new pf2e_btneq("skills.deception.rank", 1), // Deception T (yes, wrong!)
  "checkbox_275ectc": new pf2e_btneq("skills.deception.rank", 3), // Deception M
  "checkbox_276ewmc": new pf2e_btneq("skills.deception.rank", 4), // Deception L
  "checkbox_277pxjq": new pf2e_btneq("skills.diplomacy.rank", 1), // Diplomacy T
  "checkbox_278ppje": new pf2e_btneq("skills.diplomacy.rank", 2), // Diplomacy E
  "checkbox_279jfmh": new pf2e_btneq("skills.diplomacy.rank", 3), // Diplomacy M
  "checkbox_280rfpt": new pf2e_btneq("skills.diplomacy.rank", 4), // Diplomacy L
  "checkbox_281euh":  new pf2e_btneq("skills.intimidation.rank", 1), // Intimidation T
  "checkbox_282exqd": new pf2e_btneq("skills.intimidation.rank", 2), // Intimidation E
  "checkbox_283cllo": new pf2e_btneq("skills.intimidation.rank", 3), // Intimidation M
  "checkbox_284hgll": new pf2e_btneq("skills.intimidation.rank", 4), // Intimidation L
  "checkbox_285gzuu": new pf2e_btneq("skills.lore1.rank", 1), // Lore1 T
  "checkbox_286rila": new pf2e_btneq("skills.lore1.rank", 2), // Lore1 E
  "checkbox_287ejtu": new pf2e_btneq("skills.lore1.rank", 3), // Lore1 M
  "checkbox_288zjpg": new pf2e_btneq("skills.lore1.rank", 4), // Lore1 L
  "checkbox_289lfnr": new pf2e_btneq("skills.lore2.rank", 1), // Lore2 T
  "checkbox_290weau": new pf2e_btneq("skills.lore2.rank", 2), // Lore2 E
  "checkbox_291gmgg": new pf2e_btneq("skills.lore2.rank", 3), // Lore2 M
  "checkbox_292nkxg": new pf2e_btneq("skills.lore2.rank", 4), // Lore2 L
  "checkbox_293xtmb": new pf2e_btneq("skills.medicine.rank", 1), // Medicine T
  "checkbox_294zco":  new pf2e_btneq("skills.medicine.rank", 2), // Medicine E
  "checkbox_295srxf": new pf2e_btneq("skills.medicine.rank", 3), // Medicine M
  "checkbox_296bgg":  new pf2e_btneq("skills.medicine.rank", 4), // Medicine L
  "checkbox_297rswz": new pf2e_btneq("skills.nature.rank", 1), // Nature T
  "checkbox_298ozh":  new pf2e_btneq("skills.nature.rank", 2), // Nature E
  "checkbox_299wxgs": new pf2e_btneq("skills.nature.rank", 3), // Nature M
  "checkbox_300xkcz": new pf2e_btneq("skills.nature.rank", 4), // Nature L
  "checkbox_301gdph": new pf2e_btneq("skills.occultism.rank", 1), // Occultism T
  "checkbox_302othy": new pf2e_btneq("skills.occultism.rank", 2), // Occultism E
  "checkbox_303cqhg": new pf2e_btneq("skills.occultism.rank", 3), // Occultism M
  "checkbox_304esmv": new pf2e_btneq("skills.occultism.rank", 4), // Occultism L
  "checkbox_305pepp": new pf2e_btneq("skills.performance.rank", 1), // Performance T
  "checkbox_306vxjo": new pf2e_btneq("skills.performance.rank", 2), // Performance E
  "checkbox_307zpud": new pf2e_btneq("skills.performance.rank", 3), // Performance M
  "checkbox_308rssz": new pf2e_btneq("skills.performance.rank", 4), // Performance L
  "checkbox_310ohji": new pf2e_btneq("skills.religion.rank", 1), // Religion T
  "checkbox_311bjee": new pf2e_btneq("skills.religion.rank", 2), // Religion E
  "checkbox_312dvlt": new pf2e_btneq("skills.religion.rank", 3), // Religion M
  "checkbox_313crqt": new pf2e_btneq("skills.religion.rank", 4), // Religion L
  "checkbox_314nuzx": new pf2e_btneq("skills.society.rank", 1), // Society T
  "checkbox_315rphw": new pf2e_btneq("skills.society.rank", 2), // Society E
  "checkbox_316hus":  new pf2e_btneq("skills.society.rank", 3), // Society M
  "checkbox_317ijxq": new pf2e_btneq("skills.society.rank", 4), // Society L
  "checkbox_318mkyc": new pf2e_btneq("skills.stealth.rank", 1), // Stealth T
  "checkbox_319xpgt": new pf2e_btneq("skills.stealth.rank", 2), // Stealth E
  "checkbox_320yred": new pf2e_btneq("skills.stealth.rank", 3), // Stealth M
  "checkbox_321aqow": new pf2e_btneq("skills.stealth.rank", 4), // Stealth L
  "checkbox_322mqs":  new pf2e_btneq("skills.survival.rank", 1), // Survival T
  "checkbox_323fohg": new pf2e_btneq("skills.survival.rank", 2), // Survival E
  "checkbox_324rrfb": new pf2e_btneq("skills.survival.rank", 3), // Survival M
  "checkbox_325sppr": new pf2e_btneq("skills.survival.rank", 4), // Survival L
  "checkbox_326ktbd": new pf2e_btneq("skills.thievery.rank", 1), // Thievery T
  "checkbox_327rvcz": new pf2e_btneq("skills.thievery.rank", 2), // Thievery E
  "checkbox_328avwb": new pf2e_btneq("skills.thievery.rank", 3), // Thievery M
  "checkbox_329hdbx": new pf2e_btneq("skills.thievery.rank", 4), // Thievery L
// PAGE TWO
  "textarea_330vrxa": "Tx", // Held Items list
  "textarea_331jggx": "Tx", // Held Items Bulk
  "textarea_332vztk": { getValue(actor) { return actor.feats.get("class").feats.concat(actor.feats.get("classfeature")).filter(f => f.level == 1).map(f => f.feat.name) } }, // Class Feats & Features
  "textarea_333llv":  { getValue(actor) { return actor.feats.get("ancestry").feats.filter(f => f.level == 1).map(f => f.feat.name) } }, // L1-Ancestry and Heritage Abilities
  "textarea_334ehgk": { getValue(actor) { return actor.feats.get("ancestry").feats.filter(f => f.level == 1).map(f => f.feat.name) } }, // L1-Ancestry Feat
  "textarea_335xpjq": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 1).map(f => f.feat.name) } }, // L1-Background skill feat
  "textarea_336iifg": "Tx", // Consumables list
  "textarea_337opcp": "Tx", // Consumables bulk
  "textarea_338kboh": "Tx", // Worn Items bulk
  "textarea_339kiyd": "Tx", // Worn Items Invested list
  "textarea_340bioc": "Tx", // Worn Items list
  "text_341kjcb": "inventory.bulk.value.value", // Total Bulk
  "text_342xigi": "inventory.coins.cp", // Wealth CP
  "text_343hajk": "inventory.coins.sp", // Wealth SP
  "text_344fsew": "inventory.coins.gp", // Wealth GP
  "text_345wrrp": "inventory.coins.pp", // Wealth PP
  "textarea_346leyk": "Tx", // Gems and Artwork
  "textarea_347whef": "Tx", // Gems/Artwork Price
  "textarea_348elde": "Tx", // Gems/Artwork Bulk
  "textarea_349lbsn": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 2).map(f => f.feat.name) } }, // L2-Skill feat
  "textarea_350gtii": { getValue(actor) { return actor.feats.get("general").feats.filter(f => f.level == 3).map(f => f.feat.name) } }, // L3-General feat
  "textarea_351ahxr": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 4).map(f => f.feat.name) } }, // L4-Skill feat
  "textarea_352oqsr": { getValue(actor) { return actor.feats.get("ancestry").feats.filter(f => f.level == 5).map(f => f.feat.name) } }, // L5-Ancestry feat
  "textarea_353qycb": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 6).map(f => f.feat.name) } }, // L6-Skill feat
  "textarea_354gmxy": { getValue(actor) { return actor.feats.get("general").feats.filter(f => f.level == 3).map(f => f.feat.name) } }, // L7-General feat
  "textarea_355wprz": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 8).map(f => f.feat.name) } }, // L8-Skill feat
  "textarea_356nftr": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 20).map(f => f.feat.name) } }, // L20-Skill feat
  "textarea_357amcg": { getValue(actor) { return actor.feats.get("general").feats.filter(f => f.level == 19).map(f => f.feat.name) } }, // L19-General feat
  "textarea_358baxi": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 18).map(f => f.feat.name) } }, // L18-Skill feat
  "textarea_359ferr": { getValue(actor) { return actor.feats.get("ancestry").feats.filter(f => f.level == 17).map(f => f.feat.name) } }, // L17-Ancestry feat
  "textarea_360jytf": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 16).map(f => f.feat.name) } }, // L16-Skill feat
  "textarea_361lume": { getValue(actor) { return actor.feats.get("general").feats.filter(f => f.level == 15).map(f => f.feat.name) } }, // L15-General feat
  "textarea_362ccfe": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 14).map(f => f.feat.name) } }, // L14-Skill feat
  "textarea_363wtou": { getValue(actor) { return actor.feats.get("ancestry").feats.filter(f => f.level == 13).map(f => f.feat.name) } }, // L13-Ancestry feat
  "textarea_364eoiq": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 12).map(f => f.feat.name) } }, // L12-Skill feat
  "textarea_365zwsz": { getValue(actor) { return actor.feats.get("general").feats.filter(f => f.level == 11).map(f => f.feat.name) } }, // L11-General feat
  "textarea_366etrj": { getValue(actor) { return actor.feats.get("skill").feats.filter(f => f.level == 10).map(f => f.feat.name) } }, // L10-Skill feat
  "textarea_367ieb":  { getValue(actor) { return actor.feats.get("ancestry").feats.filter(f => f.level == 9).map(f => f.feat.name) } }, // L9-Ancestry feat
  "textarea_368mcmh": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 2).map(f => f.feat.name) } }, // L2-Class feat
  "textarea_369arky": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 3).map(f => f.feat.name) } }, // L3-Class feature
  "textarea_370ucdg": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 4).map(f => f.feat.name) } }, // L4-Class feat
  "textarea_371mpfw": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 5).map(f => f.feat.name) } }, // L5-Class feature
  "textarea_372wduo": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 6).map(f => f.feat.name) } }, // L6-Class feat
  "textarea_373kpha": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 7).map(f => f.feat.name) } }, // L7-Class feature
  "textarea_374fuef": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 8).map(f => f.feat.name) } }, // L8-Class feat
  "textarea_375acui": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 9).map(f => f.feat.name) } }, // L9-Class feature
  "textarea_376iaaz": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 10).map(f => f.feat.name) } }, // L10-Class feat
  "textarea_377iiyp": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 11).map(f => f.feat.name) } }, // L11-Class feature
  "textarea_378btkh": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 12).map(f => f.feat.name) } }, // L12-Class feat
  "textarea_379urqd": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 13).map(f => f.feat.name) } }, // L13-Class feature
  "textarea_380ufki": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 14).map(f => f.feat.name) } }, // L14-Class feat
  "textarea_381ikfg": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 15).map(f => f.feat.name) } }, // L15-Class feature
  "textarea_382mpwo": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 16).map(f => f.feat.name) } }, // L16-Class feat
  "textarea_383lcfn": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 17).map(f => f.feat.name) } }, // L17-Class feature
  "textarea_384qsoq": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 18).map(f => f.feat.name) } }, // L18-Class feat
  "textarea_385judo": { getValue(actor) { return actor.feats.get("classfeature").feats.filter(f => f.level == 19).map(f => f.feat.name) } }, // L19-Class feature
  "textarea_386hfib": { getValue(actor) { return actor.feats.get("class").feats.filter(f => f.level == 20).map(f => f.feat.name) } }, // L20-Class feat
// PAGE THREE
  "textarea_387ozwo": "img", // character sketch (image)
  "text_388sfhi": "Tx", // ethnicity
  "text_389ysid": "Tx", // nationality
  "text_390smqa": "system.details.biography.birthplace", // birthplace
  "text_391xzfz": "system.details.age.value", // age
  "text_392pdpc": "system.details.gender.value", // gender & pronouns
  "text_393tita": "system.details.height.value", // height
  "text_394btuu": "system.details.weight.value", // weight
  "textarea_395lsww": "system.details.biography.appearance", // appearance
  "textarea_396gkaw": "system.details.biography.appearance", // attitude
  "text_397wxmj": "deity.name", // deity or philosophy
  "textarea_398heic": "system.details.biography.edicts", // edicts (array)
  "textarea_399ebez": "system.details.biography.anathema", // anethema (array)
  "textarea_400jzmj": "system.details.biography.likes", // likes
  "textarea_401radq": "system.details.biography.dislikes", // dislikes
  "textarea_402anaj": "system.details.biography.catchphrases", // catchphrases
  "textarea_403rhmy": "system.details.biography.campaignNotes", // campaign Notes
  "textarea_404zmiz": "system.details.biography.allies", // campaign Allies
  "textarea_405vdjj": "system.details.biography.enemies", // campaign Enemies
  "textarea_406zera": "system.details.biography.organizations", // campaign Organizations
  "text_407ftzb": "Tx", // Action1 name
  "text_408mhfr": "Tx", // Free Action1 name
  "text_409bfwj": "Tx", // Action2 name
  "text_410miry": "Tx", // Action3 name
  "text_411nnfy": "Tx", // Action4 name
  "text_412wkmi": "Tx", // Free Action2 name
  "text_413hkgy": "Tx", // Free Action3 name
  "text_414bdju": "Tx", // Free Action4 name
  "text_415kszk": "Tx", // Free Action2 trigger (yes 2)
  "text_416eice": "Tx", // Free Action1 trigger
  "text_417rilh": "Tx", // Free Action3 trigger
  "text_418qaik": "Tx", // Free Action4 trigger
  "textarea_419ojrd": "Tx", // Free Action1 effects
  "textarea_420oyxt": "Tx", // Free Action2 effects
  "textarea_421exwk": "Tx", // Free Action3 effects
  "textarea_422dczp": "Tx", // Free Action4 effects
  "text_423tvmp": "Tx", // Free Action1 trait
  "text_424kynr": "Tx", // Free Action2 trait
  "text_425qxfa": "Tx", // Free Action3 trait
  "text_426ewml": "Tx", // Free Action4 trait
  "text_427kslg": "Tx", // Free Action1 page
  "text_428jkhe": "Tx", // Free Action2 page
  "text_429mono": "Tx", // Free Action3 page
  "text_430hkmt": "Tx", // Free Action4 page
  "checkbox_431dzrz": "Btn", // Free Action1 isFree
  "checkbox_432kvis": "Btn", // Free Action1 isReaction
  "checkbox_433yxly": "Btn", // Free Action2 isFree
  "checkbox_434noss": "Btn", // Free Action2 isReaction
  "checkbox_435zcre": "Btn", // Free Action3 isFree
  "checkbox_436gxtm": "Btn", // Free Action3 isReaction
  "checkbox_437ayes": "Btn", // Free Action4 isFree
  "checkbox_438gfjv": "Btn", // Free Action4 isReaction
  "text_439iolx": "Tx", // Action1 numactions
  "text_440wryw": "Tx", // Action2 numactions
  "text_441nvfv": "Tx", // Action3 numactions
  "text_442cwdd": "Tx", // Action4 numactions
  "textarea_443qoya": "Tx", // Action1 effects
  "textarea_444dxm":  "Tx", // Action2 effects
  "textarea_445fmzt": "Tx", // Action3 effects
  "textarea_446ugjv": "Tx", // Action4 effects
  "text_447djix": "Tx", // Action1 traits
  "text_448wcyu": "Tx", // Action2 traits
  "text_449sryh": "Tx", // Action3 traits
  "text_450jkvr": "Tx", // Action4 traits
  "text_451kmfd": "Tx", // Action1 page
  "text_452ddtc": "Tx", // Action2 page
  "text_453ukeb": "Tx", // Action3 page
  "text_454zwl":  "Tx", // Action4 page
// PAGE FOUR
  "checkbox_455jffm": "Btn", // Magical Tradition Arcane
  "checkbox_456jtfi": "Btn", // Magical Tradition Occult
  "checkbox_457gzjp": "Btn", // Magical Tradition Divine
  "checkbox_458xfce": "Btn", // Magical Tradition Primal
  "checkbox_459zwon": "Btn", // Prepared Caster
  "checkbox_460fmwa": "Btn", // Spontaneous Caster
  "checkbox_461qpof": "Btn", // Spell Attack T
  "checkbox_462zlaw": "Btn", // Spell Attack E
  "checkbox_463ysfu": "Btn", // Spell Attack M
  "checkbox_464qtjr": "Btn", // Spell Attack L
  "checkbox_465ysxx": "Btn", // Spell DC T
  "checkbox_466ndpi": "Btn", // Spell DC E
  "checkbox_467yjkq": "Btn", // Spell DC M
  "checkbox_468hasa": "Btn", // Spell DC L
  "text_469usdj": "spellcasting.base.mod", // Spell Attack total
  "text_470bahu": "spellcasting.base.dc.value", // Spell DC total
  "text_471tmjg": "Tx", // Spell Attack prof
  "text_472ppwy": "Tx", // Spell Attack Key
  "text_473bjbp": "Tx", // Spell DC key
  "text_474hxib": "Tx", // Spell DC prof
  "text_475qaob": "Tx", // Cantrip Rank
  "text_476epjq": "Tx", // Cantrips per Day
  "text_477bizq": "Tx", // Spells per Day L1
  "text_478ymen": "Tx", // Spells per Day L2
  "text_479grql": "Tx", // Spells per Day L3
  "text_480iivx": "Tx", // Spells per Day L4
  "text_481df":   "Tx", // Spells per Day L5
  "text_482txib": "Tx", // Spells per Day L6
  "text_483hpaj": "Tx", // Spells per Day L7
  "text_484bzr":  "Tx", // Spells per Day L8
  "text_485rhnw": "Tx", // Spells per Day L9
  "text_486ij":   "Tx", // Spells per Day L10
  "text_487tilh": "Tx", // Spells remaining L1
  "text_488tcji": "Tx", // Spells remaining L2
  "text_489opb":  "Tx", // Spells remaining L3
  "text_490essc": "Tx", // Spells remaining L4
  "text_491uqhm": "Tx", // Spells remaining L5
  "text_492bmbp": "Tx", // Spells remaining L6
  "text_493jfus": "Tx", // Spells remaining L7
  "text_494ecdm": "Tx", // Spells remaining L8
  "text_495euld": "Tx", // Spells remaining L9
  "text_496lnen": "Tx", // Spells remaining L10
  "checkbox_497nalp": "Btn", // Focus Point 1
  "checkbox_498vzol": "Btn", // Focus Point 2
  "checkbox_499vcvw": "Btn", // Focus Point 3
  "text_500fem":      "Tx", // Focus Spell Rank
  "textarea_501fwoj": "Tx", // Cantrip Names
  "textarea_502c":    "Tx", // Cantrip Actions
  "textarea_503nyfs": "Tx", // Cantrip Prep
  "textarea_504zkkz": "Tx", // Spells1 Actions
  "textarea_505pwgp": "Tx", // Spells2 Actions
  "textarea_506nwja": "Tx", // Spells1 Rank
  "textarea_507kpxe": "Tx", // Spells2 Rank
  "textarea_508pqrd": "Tx", // Rituals1 Rank
  "textarea_509iknk": "Tx", // Rituals2 Rank
  "textarea_510mvco": "Tx", // Rituals1 Name
  "textarea_511fpgh": "Tx", // Rituals2 Name
  "textarea_512mawd": "Tx", // Focus Spells Name
  "textarea_513vwpi": "Tx", // Focus Spells Actions
  "textarea_514lwyk": "Tx", // Innate Spells Name
  "textarea_515bzeo": "Tx", // Innate Spells Actions
  "textarea_516jawj": "Tx", // Innate Spells Freq
  "textarea_517vrw":  "Tx", // Spells1 Prep
  "textarea_518jeoq": "Tx", // Spells2 Prep
  "textarea_519gydf": "Tx", // Rituals1 Cost
  "textarea_520epty": "Tx"  // Rituals2 Cost
}