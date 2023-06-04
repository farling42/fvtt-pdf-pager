// Map PDF Field Name to Actor data field
export let actormap = {
	"Name":"name",
	"Descriptor":"system.basic.descriptor",
	"Focus":"system.basic.focus",
	"Type":"system.basic.type",
	"Type_Focus_or_Other":"system.basic.additionalSentence",
	"Tier": "system.basic.tier",
	"Effort": "system.basic.effort",
	"XP": "system.basic.xp",
	"Might": "system.pools.might.value",
	"Speed": "system.pools.speed.value",
	"Intellect": "system.pools.intellect.value",
	"Might_Pool": "system.pools.might.max",
	"Speed_Pool": "system.pools.speed.max",
	"Intellect_Pool": "system.pools.intellect.max",
	"Might_Edge": "system.pools.might.edge",
	"Speed_Edge": "system.pools.speed.edge",
	"Intellect_Edge": "system.pools.intellect.edge",
	"Recovery_Roll": "system.combat.recoveries.roll",
	"1_ACTION": "system.combat.recoveries.oneAction",
	"10_Min": "system.combat.recoveries.tenMinutes",
	"1_Hour": "system.combat.recoveries.oneHour",
	"10_Hours": "system.combat.recoveries.tenHours",
	"Cyphers_Limit":"system.equipment.cypherLimit",
	"Increase_Capabilities":"system.basic.advancement.stats",
	"Move_Toward_Perfection":"system.basic.advancement.edge",
	"Extra_Effort":"system.basic.advancement.effort",
	"Skill_Training":"system.basic.advancement.skill",
	"Other":"system.basic.advancement.other",
	"Background": {
		async getValue(actor) { return TextEditor.enrichHTML(actor.system.description, {async:true} ); } 
	},
	"Notes": {
		async getValue(actor) { return TextEditor.enrichHTML(actor.system.notes, {async:true} ); }
	},
	"Impaired": {
		getValue(actor) { return actor.system.combat.damageTrack.state == 'Impaired'; },
		setValue(actor,value) {
			if (value)
				actor.update({ ["system.combat.damageTrack.state"] : 'Impaired' });
			else if (actor.system.combat.damageTrack.state == 'Impaired')
				actor.update({ ["system.combat.damageTrack.state"] : 'Hale' })
		}
	},
	"Debilitated": {
		getValue(actor) { return actor.system.combat.damageTrack.state == 'Debilitated' },
		setValue(actor,value) {
			if (value)
				actor.update({ ["system.combat.damageTrack.state"] : 'Debilitated' });
			else if (actor.system.combat.damageTrack.state == 'Debilitated')
				actor.update({ ["system.combat.damageTrack.state"] : 'Hale' })
		}
	},
	"Special_Abilities": {
		getValue(actor) {
			let result = "";
			for (const item of actor.items.filter(it => it.type === 'ability'))
				result += `${item.name}:\n${item.system.description}\n\n`;
			return result;
		}
	}
}

/*
pdf-editable.mjs:431 Special_Abilities (Tx)
pdf-editable.mjs:431 Recovery_Roll (Tx)
pdf-editable.mjs:431 Skills_1 (Tx)
pdf-editable.mjs:431 Skills_P_1 (Tx)
pdf-editable.mjs:431 Skills_T_1 (Btn)
pdf-editable.mjs:431 Skills_S_1 (Btn)
pdf-editable.mjs:431 Skills_I_1 (Btn)
pdf-editable.mjs:431 Skills_2 (Tx)
pdf-editable.mjs:431 Skills_P_2 (Tx)
pdf-editable.mjs:431 Skills_T_2 (Btn)
pdf-editable.mjs:431 Skills_S_2 (Btn)
pdf-editable.mjs:431 Skills_I_2 (Btn)
pdf-editable.mjs:431 Skills_3 (Tx)
pdf-editable.mjs:431 Skills_P_3 (Tx)
pdf-editable.mjs:431 Skills_T_3 (Btn)
pdf-editable.mjs:431 Skills_S_3 (Btn)
pdf-editable.mjs:431 Skills_I_3 (Btn)
pdf-editable.mjs:431 Skills_4 (Tx)
pdf-editable.mjs:431 Skills_P_4 (Tx)
pdf-editable.mjs:431 Skills_T_4 (Btn)
pdf-editable.mjs:431 Skills_S_4 (Btn)
pdf-editable.mjs:431 Skills_I_4 (Btn)
pdf-editable.mjs:431 Skills_5 (Tx)
pdf-editable.mjs:431 Skills_P_5 (Tx)
pdf-editable.mjs:431 Skills_T_5 (Btn)
pdf-editable.mjs:431 Skills_S_5 (Btn)
pdf-editable.mjs:431 Skills_I_5 (Btn)
pdf-editable.mjs:431 Skills_6 (Tx)
pdf-editable.mjs:431 Skills_P_6 (Tx)
pdf-editable.mjs:431 Skills_T_6 (Btn)
pdf-editable.mjs:431 Skills_S_6 (Btn)
pdf-editable.mjs:431 Skills_I_6 (Btn)
pdf-editable.mjs:431 Skills_7 (Tx)
pdf-editable.mjs:431 Skills_P_7 (Tx)
pdf-editable.mjs:431 Skills_T_7 (Btn)
pdf-editable.mjs:431 Skills_S_7 (Btn)
pdf-editable.mjs:431 Skills_I_7 (Btn)
pdf-editable.mjs:431 Skills_8 (Tx)
pdf-editable.mjs:431 Skills_P_8 (Tx)
pdf-editable.mjs:431 Skills_T_8 (Btn)
pdf-editable.mjs:431 Skills_S_8 (Btn)
pdf-editable.mjs:431 Skills_I_8 (Btn)
pdf-editable.mjs:431 Skills_9 (Tx)
pdf-editable.mjs:431 Skills_P_9 (Tx)
pdf-editable.mjs:431 Skills_T_9 (Btn)
pdf-editable.mjs:431 Skills_S_9 (Btn)
pdf-editable.mjs:431 Skills_I_9 (Btn)
pdf-editable.mjs:431 Skills_10 (Tx)
pdf-editable.mjs:431 Skills_P_10 (Tx)
pdf-editable.mjs:431 Skills_T_10 (Btn)
pdf-editable.mjs:431 Skills_S_10 (Btn)
pdf-editable.mjs:431 Skills_I_10 (Btn)
pdf-editable.mjs:431 Skills_11 (Tx)
pdf-editable.mjs:431 Skills_P_11 (Tx)
pdf-editable.mjs:431 Skills_T_11 (Btn)
pdf-editable.mjs:431 Skills_S_11 (Btn)
pdf-editable.mjs:431 Skills_I_11 (Btn)
pdf-editable.mjs:431 Skills_12 (Tx)
pdf-editable.mjs:431 Skills_P_12 (Tx)
pdf-editable.mjs:431 Skills_T_12 (Btn)
pdf-editable.mjs:431 Skills_S_12 (Btn)
pdf-editable.mjs:431 Skills_I_12 (Btn)
pdf-editable.mjs:431 Skills_13 (Tx)
pdf-editable.mjs:431 Skills_P_13 (Tx)
pdf-editable.mjs:431 Skills_T_13 (Btn)
pdf-editable.mjs:431 Skills_S_13 (Btn)
pdf-editable.mjs:431 Skills_I_13 (Btn)
pdf-editable.mjs:431 Skills_14 (Tx)
pdf-editable.mjs:431 Skills_P_14 (Tx)
pdf-editable.mjs:431 Skills_T_14 (Btn)
pdf-editable.mjs:431 Skills_S_14 (Btn)
pdf-editable.mjs:431 Skills_I_14 (Btn)
pdf-editable.mjs:431 Attacks_1 (Tx)
pdf-editable.mjs:431 Attacks_Mod_1 (Tx)
pdf-editable.mjs:431 Attacks_Dam_1 (Tx)
pdf-editable.mjs:431 Attacks_2 (Tx)
pdf-editable.mjs:431 Attacks_Mod_2 (Tx)
pdf-editable.mjs:431 Attacks_Dam_2 (Tx)
pdf-editable.mjs:431 Attacks_3 (Tx)
pdf-editable.mjs:431 Attacks_Mod_3 (Tx)
pdf-editable.mjs:431 Attacks_Dam_3 (Tx)
pdf-editable.mjs:431 Attacks_4 (Tx)
pdf-editable.mjs:431 Attacks_Mod_4 (Tx)
pdf-editable.mjs:431 Attacks_Dam_4 (Tx)
pdf-editable.mjs:431 Attacks_5 (Tx)
pdf-editable.mjs:431 Attacks_Mod_5 (Tx)
pdf-editable.mjs:431 Attacks_Dam_5 (Tx)
pdf-editable.mjs:431 Attacks_6 (Tx)
pdf-editable.mjs:431 Attacks_Mod_6 (Tx)
pdf-editable.mjs:431 Attacks_Dam_6 (Tx)
pdf-editable.mjs:431 Attacks_7 (Tx)
pdf-editable.mjs:431 Attacks_Mod_7 (Tx)
pdf-editable.mjs:431 Attacks_Dam_7 (Tx)
pdf-editable.mjs:431 Cyphers (Tx)
pdf-editable.mjs:431 Equipment (Tx)
pdf-editable.mjs:431 Armor (Tx)
pdf-editable.mjs:431 Money (Tx)
*/