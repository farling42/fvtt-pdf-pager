export let namemap = {
    // 5E_CharacterSheet_Fillable.pdf
    "CharacterName": "name",
    "CharacterName 2": "name",
    "STR": "system.abilities.str.value",
    "DEX": "system.abilities.dex.value",
    "CON": "system.abilities.con.value",
    "INT": "system.abilities.int.value",
    "WIS": "system.abilities.wis.value",
    "CHA": "system.abilities.cha.value",
    "STRmod": "system.abilities.str.mod",
    "DEXmod": "system.abilities.dex.mod",
    "CONmod": "system.abilities.con.mod",
    "INTmod": "system.abilities.int.mod",
    "WISmod": "system.abilities.wis.mod",
    "CHamod": "system.abilities.cha.mod",
    "HPCurrent": "system.attributes.hp.value",
    "HPMax":     "system.attributes.hp.max",
    "HPTemp":    "system.attributes.hp.temp",
    "HD":        "system.attributes.hd",
    "HDTotal":   "system.details.level",
    "ST Strength":     "system.abilities.str.save",
    "Check Box 11":    "system.abilities.str.proficient",
    "ST Dexterity":    "system.abilities.dex.save",
    "Check Box 18":    "system.abilities.dex.proficient",
    "ST Constitution": "system.abilities.con.save",
    "Check Box 19":    "system.abilities.con.proficient",
    "ST Intelligence": "system.abilities.int.save",
    "Check Box 20":    "system.abilities.int.proficient",
    "ST Wisdom":       "system.abilities.wis.save",
    "Check Box 21":    "system.abilities.wis.proficient",
    "ST Charisma":     "system.abilities.cha.save",
    "Check Box 22":    "system.abilities.cha.proficient",
    "Initiative":      "system.attributes.init.total",
    "PersonalityTraits": "system.details.trait",
    "Ideals":            "system.details.ideal",
    "Bonds":             "system.details.bond",
    "Flaws":             "system.details.flaw",
    //"Features and Traits":
    //"Class and Level":
    "Background":       "system.details.background",
    //"Player Name":      "system.details.playerName",   "=game.actors.get(system.ownership.first)"
    "Race":             "system.details.race",
    "Alignment":        "system.details.alignment",
    "XP":               "system.details.xp.value",
    "ProfBonus":        "system.attributes.prof",
    "Speed":            "system.attributes.movement.walk",
    "AC":               "system.attributes.ac.value",
    "Passive":          "system.skills.prc.passive",
    "CP":               "system.currency.cp",
    "SP":               "system.currency.sp",
    "EP":               "system.currency.ep",
    "GP":               "system.currency.gp",
    "PP":               "system.currency.pp",
    // Skills
    "Acrobatics":    "system.skills.acr.total",
    "Check Box 23":  "system.skills.acr.proficient",
    "Animal":        "system.skills.ani.total",
    "Check Box 24":  "system.skills.ani.proficient",
    "Arcana":        "system.skills.arc.total",
    "Check Box 25":  "system.skills.arc.proficient",
    "Athletics":     "system.skills.ath.total",
    "Check Box 26":  "system.skills.ath.proficient",
    "Deception":     "system.skills.dec.total",
    "Check Box 27":  "system.skills.dec.proficient",
    "History":       "system.skills.his.total",
    "Check Box 28":  "system.skills.his.proficient",
    "Insight":       "system.skills.ins.total",
    "Check Box 29":  "system.skills.ins.proficient",
    "Intimidation":  "system.skills.itm.total",
    "Check Box 30":  "system.skills.itm.proficient",
    "Investigation": "system.skills.inv.total",
    "Check Box 31":  "system.skills.inv.proficient",
    "Medicine":      "system.skills.med.total",
    "Check Box 32":  "system.skills.med.proficient",
    "Nature":        "system.skills.nat.total",
    "Check Box 33":  "system.skills.nat.proficient",
    "Perception":    "system.skills.prc.total",
    "Check Box 34":  "system.skills.prc.proficient",
    "Performance":   "system.skills.prf.total",
    "Check Box 35":  "system.skills.prf.proficient",
    "Persuasion":    "system.skills.per.total",
    "Check Box 36":  "system.skills.per.proficient",
    "Religion":      "system.skills.rel.total",
    "Check Box 37":  "system.skills.rel.proficient",
    "SleightofHand": "system.skills.slt.total",
    "Check Box 38":  "system.skills.slt.proficient",
    "Stealth":       "system.skills.ste.total",
    "Check Box 39":  "system.skills.ste.proficient",
    "Survival":      "system.skills.sur.total",
    "Check Box 40":  "system.skills.sur.proficient",
    // details
    "Age":    "system.details.age",
    "Height": "system.details.height",
    "Weight": "system.details.weight",
    "Eyes":   "system.details.eyes",
    "Skin":   "system.details.skin",
    "Hair":   "system.details.hair",
    // Calculated
    "Inspiration": { // "system.attributes.inspiration"
        getValue(actor) {
            return actor.system.attributes.inspiration ? "Y" : "";
        },
        setValue(actor, value) {
            actor.update( { ["system.attributes.inspiration"] : (value?.length > 0) })
        }
    },     
    "PlayerName": { // readonly
        getValue(actor) {
            for (const [key, value] of Object.entries(actor.ownership)) {
                if (value === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER &&
                    game.users.get(key).role != CONST.USER_ROLES.GAMEMASTER)
                {
                    return game.users.get(key).name;
                } 
            }
        },
    },
}