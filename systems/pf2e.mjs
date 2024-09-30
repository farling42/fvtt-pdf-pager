class pf2e_btn {
  constructor(field, value) {
    this.fieldName = field;
    this.value = value;
  }
  getValue(actor) {
    return foundry.utils.getProperty(actor, this.field) === this.value;
  }
}

export let actormap = {
  "textarea_1mgbu": "name", // Name
  "textarea_2fdvi":  { getValue(actor) { "Tx" }},  // Player Name
  "textarea_3ovje": "system.details.xp.value",  // XP
  "textarea_4pzs":  "system.details.level.value",  // level
  "checkbox_5xofc": new pf2e_btn("heroPoints.value", 1), // hero1
  "checkbox_6hrfm": new pf2e_btn("heroPoints.value", 2), // hero2
  "checkbox_7kodx": new pf2e_btn("heroPoints.value", 3), // hero3
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
  "checkbox_23wguq": new pf2e_btn("saves.will.rank", 1), // Will Save T
  "checkbox_24vupa": new pf2e_btn("saves.will.rank", 2), // Will Save E
  "checkbox_25itkc": new pf2e_btn("saves.will.rank", 3), // Will Save M
  "checkbox_26pidm": new pf2e_btn("saves.will.rank", 4), // Will Save L
  "checkbox_27hggm": new pf2e_btn("saves.reflex.rank", 1), // Ref Save T
  "checkbox_28genn": new pf2e_btn("saves.reflex.rank", 2), // Ref Save E
  "checkbox_29rnjq": new pf2e_btn("saves.reflex.rank", 3), // Ref Save M
  "checkbox_30mata": new pf2e_btn("saves.reflex.rank", 4), // Ref Save L
  "checkbox_31nubu": new pf2e_btn("saves.fortitude.rank", 1), // Fort Save T
  "checkbox_32kxvm": new pf2e_btn("saves.fortitude.rank", 2), // Fort Save E
  "checkbox_33rqu":  new pf2e_btn("saves.fortitude.rank", 3),  // Fort Save M
  "checkbox_34zbhl": new pf2e_btn("saves.fortitude.rank", 4), // Fort Save L
  "text_35baby": "system.shield.hardness", // Shield Hardness
  "text_36ccwn": "system.shield.hp.max", // Shield Max HP
  "text_37jfu":  "system.shield.brokenThreshold", // Shield BT
  "text_38yxhc": "system.shield.hp.value", // Shield HP
  "text_39mwlp": "system.shield.ac", // AC shield
  "text_40dugs": "system.ac.value", // AC total
  "text_41cauv": "Tx", // DEX bonus to AC
  "text_42sekz": "Tx", // PROF bonus to AC
  "text_43tmuz": "Tx", // Item bonus to AC
  "checkbox_44scmk": "Btn", // STR partial boost
  "checkbox_45rhlv": "Btn", // DEX partial boost
  "checkbox_46nqfi": "Btn", // CON partial boost
  "checkbox_47lxic": "Btn", // INT partial boost
  "checkbox_48ivsd": "Btn", // WIS partial boost
  "checkbox_49vspn": "Btn", // CHA partial boost
  "textarea_50jdlf": "hitPoints.value",  // Current HP
  "text_51ziym": "hitPoints.temp", // Temp HP
  "text_52sffw": "system.attributes.wounded.value", // Wounded level
  "checkbox_53oyeq": new pf2e_btn("system.attributes.dying.value", 1), // Dying 1
  "checkbox_54kmmt": new pf2e_btn("system.attributes.dying.value", 2), // Dying 2
  "checkbox_55aeec": new pf2e_btn("system.attributes.dying.value", 3), // Dying 3
  "checkbox_56vjlu": new pf2e_btn("system.attributes.dying.value", 4), // Dying 4
  "text_57tnsn": "Tx", // FORT CON bonus
  "text_58injx": "Tx", // FORT prof
  "text_59cdbw": "Tx", // FORT item
  "text_60dldn": "Tx", // REF DEX bonus
  "text_61ejsr": "Tx", // REF prof
  "text_62xfzn": "Tx", // REF item
  "text_63lmfl": "Tx", // WILL WIS bonus
  "text_64fgfg": "Tx", // WILL prof
  "text_65tgvv": "Tx", // WILL item
  "text_66qbaz": "saves.fortitude.mod", // FORT save
  "text_67mrij": "saves.reflex.mod", // REFLEX save
  "text_68jgip": "saves.will.mod", // WILL save
  "checkbox_69kbwv": "Btn", // Armor Prof: Heavy T
  "checkbox_70aqce": "Btn", // Armor Prof: Heavy E
  "checkbox_71vjy":  "Btn", // Armor Prof: Heavy M
  "checkbox_72ub":   "Btn", // Armor Prof: Heavy L
  "checkbox_73ntxl": "Btn", // Armor Prof: Medium T
  "checkbox_74iuay": "Btn", // Armor Prof: Medium E
  "checkbox_75smam": "Btn", // Armor Prof: Medium M
  "checkbox_76ddq":  "Btn", // Armor Prof: Medium L
  "checkbox_77aekt": "Btn", // Armor Prof: Light T
  "checkbox_78yugv": "Btn", // Armor Prof: Light E
  "checkbox_79osmb": "Btn", // Armor Prof: Light M
  "checkbox_80xfou": "Btn", // Armor Prof: Light L
  "checkbox_81ifhe": "Btn", // Armor Prof: Unarmored T
  "checkbox_82jzus": "Btn", // Armor Prof: Unarmored E
  "checkbox_83tbtz": "Btn", // Armor Prof: Unarmored M
  "checkbox_84alhq": "Btn", // Armor Prof: Unarmored L
  "textarea_85chme": "Tx",  // Defenses Notes
  "textarea_86oxoo": "Tx",  // Resistance & Immunities
  "textarea_87nkni": "Tx",  // Conditions
  "textarea_88pngh": "Tx",  // Languages
  "text_89fwcj": "perception.attributeModifier.modifier", // Perception WIS bonus
  "text_90nhda": "Tx", // Perception Prof Bonus
  "text_91skpg": "Tx", // Perception Item Bonus
  "text_92cge":  "Tx", // Speed
  "text_93soao": "perception.mod", // Perception Score
  "checkbox_94iccy": "Btn", // Perception Prof T
  "checkbox_95psap": "Btn", // Perception Prof E
  "checkbox_96zwyo": "Btn", // Perception Prof M
  "checkbox_97dmxm": "Btn", // Perception Prof L
  "textarea_98nqed": "Tx", // Senses and Notes
  "textarea_99qcfn": "Tx", // Special Movement
  "textarea_100weee": "Tx", // Skill Notes
  "text_101elkf": "Tx", // Weapon1 name
  "text_102hko": "Tx", // Weapon2 name
  "text_103iqhr": "Tx", // Weapon3 name
  "text_104osck": "Tx", // Weapon4 name
  "text_105zorp": "Tx", // Weapon5 name
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
  "text_129myfs": "Tx", // class DC key
  "text_130ifxl": "Tx", // class DC prof bonus
  "text_131yqxz": "Tx", // class DC item bonus
  "text_132fjev": "skills.acrobatics.attributeModifier.modifier", // Acrobatics DEX bonus
  "text_133lgl":  "skills.acrobatics.rank", // Acrobatics Prof bonus
  "text_134zleo": "Tx", // Acrobatics Item bonus
  "text_135vtls": "Tx", // Acrobatics Armor penalty
  "text_136xoeq": "Tx", // Arcana INT bonus
  "text_137alfu": "Tx", // Arcane prof bonus
  "text_138unhe": "Tx", // Arcane item bonus
  "text_139zqex": "Tx", // Athletics STR bonus
  "text_140bvdu": "Tx", // Athletics prof bonus
  "text_141pqiy": "Tx", // Athletics item bonus
  "text_142ejye": "Tx", // Athletics armor bonus
  "text_143bfbo": "Tx", // Crafting INT bonus
  "text_144edbk": "Tx", // Crafting prof bonus
  "text_145coye": "Tx", // Crafting item bonus
  "text_146nold": "Tx", // Deception CHA
  "text_147ekvl": "Tx", // Deceptoin prof
  "text_148dduu": "Tx", // Deception item
  "text_149dvo":  "Tx", // Diplomacy CHA
  "text_150fobz": "Tx", // Diplomacy prof
  "text_151xcas": "Tx", // Diplomacy item
  "text_152yzxc": "Tx", // Intimidation CHA
  "text_153gibm": "Tx", // Intimidation prof
  "text_154shtd": "Tx", // Intimidation item
  "text_155pcuy": "Tx", // Lore1 INT
  "text_156bedf": "Tx", // Lore1 prof
  "text_157lvyn": "Tx", // Lore1 item
  "text_158mnfd": "Tx", // Lore2 INT
  "text_159pjpk": "Tx", // Lore2 prof
  "text_160fwnt": "Tx", // Lore2 item
  "text_161kopr": "Tx", // Medicine WIS
  "text_162kakl": "Tx", // Medicine prof
  "text_163els":  "Tx", // Medicine item
  "text_164elvp": "Tx", // Nature WIS
  "text_165leru": "Tx", // Nature prof
  "text_166cpld": "Tx", // Nature item
  "text_167sj":   "Tx", // Occultism INT
  "text_168qbmf": "Tx", // Occultism prof
  "text_169rkty": "Tx", // Occultism item
  "text_170lbzo": "Tx", // Performance CHA
  "text_171srjb": "Tx", // Performance prof
  "text_172jkpz": "Tx", // Performance item
  "text_173kryq": "Tx", // Religion WIS
  "text_174lrcs": "Tx", // Religion prof
  "text_175kwuc": "Tx", // Religion item
  "text_176jdwb": "Tx", // Society INT
  "text_177zjeg": "Tx", // Society prof
  "text_178wpfa": "Tx", // Society item
  "text_179uyco": "Tx", // Stealth DEX
  "text_180zhdd": "Tx", // Stealth prof
  "text_181aqlp": "Tx", // Stealth item
  "text_182zupt": "Tx", // Stealth survival
  "text_183clrx": "Tx", // Survival WIS
  "text_184kwvv": "Tx", // Survival prof
  "text_185kvqt": "Tx", // Survival item
  "text_186vyku": "Tx", // Thievery DEX
  "text_187ixwx": "Tx", // Thievery prof
  "text_188qfmm": "Tx", // Thievery item
  "text_189nkbr": "Tx", // Thievery armor
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
  "checkbox_236ruuj": "Btn", // Weapon Unarmed T
  "checkbox_237ftki": "Btn", // Weapon Unarmed E
  "checkbox_238imqe": "Btn", // Weapon Unarmed M
  "checkbox_239dxvo": "Btn", // Weapon Unarmed L
  "checkbox_240vjwp": "Btn", // Weapon Simple T 
  "checkbox_241pypb": "Btn", // Weapon Simple E
  "checkbox_242bjzh": "Btn", // Weapon Simple M
  "checkbox_243zlqn": "Btn", // Weapon Simple L
  "checkbox_244hsye": "Btn", // Weapon Martial T
  "checkbox_245ktxc": "Btn", // Weapon Martial E
  "checkbox_246xxrh": "Btn", // Weapon Martial M
  "checkbox_247pbnm": "Btn", // Weapon Martial L
  "checkbox_248qcfe": "Btn", // Weapon Advanced T
  "checkbox_249tqec": "Btn", // Weapon Advanced E
  "checkbox_250bate": "Btn", // Weapon Advanced M
  "checkbox_251whzs": "Btn", // Weapon Advanced L
  "checkbox_252lxty": "Btn", // Weapon Other T
  "checkbox_253vtvt": "Btn", // Weapon Other E
  "checkbox_254qzrs": "Btn", // Weapon Other M
  "checkbox_255drpy": "Btn", // Weapon Other L
  "checkbox_256jvkx": "Btn", // Acrobatics Prof T
  "checkbox_257gmjm": "Btn", // Acrobatics Prof E
  "checkbox_258xxkb": "Btn", // Acrobatics Prof M
  "checkbox_259jndm": "Btn", // Acrobatics Prof L
  "checkbox_260iaod": "Btn", // Arcana T
  "checkbox_261atgn": "Btn", // Arcana E
  "checkbox_262umrs": "Btn", // Arcana M
  "checkbox_263arvz": "Btn", // Arcana L
  "checkbox_264ospc": "Btn", // Athletics T
  "checkbox_265bnjw": "Btn", // Athletics E
  "checkbox_266wbpc": "Btn", // Athletics M
  "checkbox_267qfwh": "Btn", // Athletics L
  "checkbox_268pyqw": "Btn", // Crafting T
  "checkbox_269gtmq": "Btn", // Crafting E
  "checkbox_270jdwc": "Btn", // Crafting M
  "checkbox_271rhso": "Btn", // Crafting L
  "checkbox_272pejf": "Btn", // 
  "checkbox_273vzx":  "Btn", // Deception E
  "checkbox_274ogyw": "Btn", // Deception T (yes, wrong!)
  "checkbox_275ectc": "Btn", // Deception M
  "checkbox_276ewmc": "Btn", // Deception L
  "checkbox_277pxjq": "Btn", // Diplomacy T
  "checkbox_278ppje": "Btn", // Diplomacy E
  "checkbox_279jfmh": "Btn", // Diplomacy M
  "checkbox_280rfpt": "Btn", // Diplomacy L
  "checkbox_281euh":  "Btn", // Intimidation T
  "checkbox_282exqd": "Btn", // Intimidation E
  "checkbox_283cllo": "Btn", // Intimidation M
  "checkbox_284hgll": "Btn", // Intimidation L
  "checkbox_285gzuu": "Btn", // Lore1 T
  "checkbox_286rila": "Btn", // Lore1 E
  "checkbox_287ejtu": "Btn", // Lore1 M
  "checkbox_288zjpg": "Btn", // Lore1 L
  "checkbox_289lfnr": "Btn", // Lore2 T
  "checkbox_290weau": "Btn", // Lore2 E
  "checkbox_291gmgg": "Btn", // Lore2 M
  "checkbox_292nkxg": "Btn", // Lore2 L
  "checkbox_293xtmb": "Btn", // Medicine T
  "checkbox_294zco":  "Btn", // Medicine E
  "checkbox_295srxf": "Btn", // Medicine M
  "checkbox_296bgg":  "Btn", // Medicine L
  "checkbox_297rswz": "Btn", // Nature T
  "checkbox_298ozh":  "Btn", // Nature E
  "checkbox_299wxgs": "Btn", // Nature M
  "checkbox_300xkcz": "Btn", // Nature L
  "checkbox_301gdph": "Btn", // Occultism T
  "checkbox_302othy": "Btn", // Occultism E
  "checkbox_303cqhg": "Btn", // Occultism M
  "checkbox_304esmv": "Btn", // Occultism L
  "checkbox_305pepp": "Btn", // Performance T
  "checkbox_306vxjo": "Btn", // Performance E
  "checkbox_307zpud": "Btn", // Performance M
  "checkbox_308rssz": "Btn", // Performance L
  "checkbox_310ohji": "Btn", // Religion T
  "checkbox_311bjee": "Btn", // Religion E
  "checkbox_312dvlt": "Btn", // Religion M
  "checkbox_313crqt": "Btn", // Religion L
  "checkbox_314nuzx": "Btn", // Society T
  "checkbox_315rphw": "Btn", // Society E
  "checkbox_316hus":  "Btn", // Society M
  "checkbox_317ijxq": "Btn", // Society L
  "checkbox_318mkyc": "Btn", // Stealth T
  "checkbox_319xpgt": "Btn", // Stealth E
  "checkbox_320yred": "Btn", // Stealth M
  "checkbox_321aqow": "Btn", // Stealth L
  "checkbox_322mqs":  "Btn", // Survival T
  "checkbox_323fohg": "Btn", // Survival E
  "checkbox_324rrfb": "Btn", // Survival M
  "checkbox_325sppr": "Btn", // Survival L
  "checkbox_326ktbd": "Btn", // Thievery T
  "checkbox_327rvcz": "Btn", // Thievery E
  "checkbox_328avwb": "Btn", // Thievery M
  "checkbox_329hdbx": "Btn", // Thievery L
// PAGE TWO
  "textarea_330vrxa": "Tx", // Held Items list
  "textarea_331jggx": "Tx", // Held Items Bulk
  "textarea_332vztk": "Tx", // Class Feats & Features
  "textarea_333llv":  "Tx", // L1-Ancestry and Heritage Abilities
  "textarea_334ehgk": "Tx", // L1-Ancestry Feat
  "textarea_335xpjq": "Tx", // L1-Background skill feat
  "textarea_336iifg": "Tx", // Consumables list
  "textarea_337opcp": "Tx", // Consumables bulk
  "textarea_338kboh": "Tx", // Worn Items bulk
  "textarea_339kiyd": "Tx", // Worn Items Invested list
  "textarea_340bioc": "Tx", // Worn Items list
  "text_341kjcb": "Tx", // Total Bulk
  "text_342xigi": "Tx", // Wealth CP
  "text_343hajk": "Tx", // Wealth SP
  "text_344fsew": "Tx", // Wealth GP
  "text_345wrrp": "Tx", // Wealth PP
  "textarea_346leyk": "Tx", // Gems and Artwork
  "textarea_347whef": "Tx", // Gems/Artwork Price
  "textarea_348elde": "Tx", // Gems/Artwork Bulk
  "textarea_349lbsn": "Tx", // L2-Skill feat
  "textarea_350gtii": "Tx", // L3-General feat
  "textarea_351ahxr": "Tx", // L4-Skill feat
  "textarea_352oqsr": "Tx", // L5-Ancestry feat
  "textarea_353qycb": "Tx", // L6-Skill feat
  "textarea_354gmxy": "Tx", // L7-General feat
  "textarea_355wprz": "Tx", // L8-Skill feat
  "textarea_356nftr": "Tx", // L20-Skill feat
  "textarea_357amcg": "Tx", // L19-General feat
  "textarea_358baxi": "Tx", // L18-Skill feat
  "textarea_359ferr": "Tx", // L17-Ancestry feat
  "textarea_360jytf": "Tx", // L16-Skill feat
  "textarea_361lume": "Tx", // L15-General feat
  "textarea_362ccfe": "Tx", // L14-Skill feat
  "textarea_363wtou": "Tx", // L13-Ancestry feat
  "textarea_364eoiq": "Tx", // L12-Skill feat
  "textarea_365zwsz": "Tx", // L11-General feat
  "textarea_366etrj": "Tx", // L10-Skill feat
  "textarea_367ieb":  "Tx", // L9-Ancestry feat
  "textarea_368mcmh": "Tx", // L2-Class feat
  "textarea_369arky": "Tx", // L3-Class feature
  "textarea_370ucdg": "Tx", // L4-Class feat
  "textarea_371mpfw": "Tx", // L5-Class feature
  "textarea_372wduo": "Tx", // L6-Class feat
  "textarea_373kpha": "Tx", // L7-Class feature
  "textarea_374fuef": "Tx", // L8-Class feat
  "textarea_375acui": "Tx", // L9-Class feature
  "textarea_376iaaz": "Tx", // L10-Class feat
  "textarea_377iiyp": "Tx", // L11-Class feature
  "textarea_378btkh": "Tx", // L12-Class feat
  "textarea_379urqd": "Tx", // L13-Class feature
  "textarea_380ufki": "Tx", // L14-Class feat
  "textarea_381ikfg": "Tx", // L15-Class feature
  "textarea_382mpwo": "Tx", // L16-Class feat
  "textarea_383lcfn": "Tx", // L17-Class feature
  "textarea_384qsoq": "Tx", // L18-Class feat
  "textarea_385judo": "Tx", // L19-Class feature
  "textarea_386hfib": "Tx", // L20-Class feat
// PAGE THREE
  "textarea_387ozwo": "Tx", // character sketch (image)
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