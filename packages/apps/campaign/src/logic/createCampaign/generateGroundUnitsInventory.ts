import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { createUniqueId } from "solid-js";

import * as Domain from "../../domain";

export function generateGroundGroupInventory(
	faction: DcsJs.Faction,
	dataStore: Types.Campaign.DataStore,
	groupType: "armor" | "infantry",
) {
	const template = dataStore.groundUnitsTemplates?.find((t) => faction.templateName === t.name);

	if (template == null) {
		throw new Error(`generateGroundGroupInventory: ground units template: ${faction.templateName} not found`);
	}

	const armorTemplates: Array<DcsJs.CampaignUnit> = template.vehicles.map((name) => {
		return {
			id: "",
			name: name,
			displayName: name,
			alive: true,
			category: "Armor",
			state: "idle",
			vehicleTypes: ["Armored"],
		};
	});

	const infantryTemplates: Array<DcsJs.CampaignUnit> = template.infantries.map((name) => {
		return {
			id: "",
			name: name,
			displayName: name,
			alive: true,
			category: "Infantry",
			state: "idle",
			vehicleTypes: ["Infantry"],
		};
	});

	const armorShoradTemplates: Array<DcsJs.CampaignUnit> = template.shoradVehicles.map((name) => {
		return {
			id: "",
			name,
			displayName: name,
			alive: true,
			category: "Air Defence",
			state: "idle",
			vehicleTypes: ["SHORAD"],
		};
	});

	const infantryShoradTemplates: Array<DcsJs.CampaignUnit> = template.shoradInfantries.map((name) => {
		return {
			id: "",
			name,
			displayName: name,
			alive: true,
			category: "Air Defence",
			state: "idle",
			vehicleTypes: ["SHORAD", "Infantry"],
		};
	});

	const groundUnits: Array<DcsJs.CampaignUnit> = [];
	const shoradGroundUnits: Array<DcsJs.CampaignUnit> = [];

	const groupTypeTemplates = groupType === "armor" ? armorTemplates : infantryTemplates;
	const groupTypeShoradTemplates = groupType === "armor" ? armorShoradTemplates : infantryShoradTemplates;

	if (groupTypeTemplates.length > 0) {
		Array.from({ length: 8 }, () => {
			const id = createUniqueId();

			const unitTemplate = Domain.Random.item(groupTypeTemplates);

			if (unitTemplate) {
				groundUnits.push({
					...unitTemplate,
					id,
					displayName: `${unitTemplate.name}|${id}`,
				});
			}
		});
	}

	if (groupTypeShoradTemplates.length > 0) {
		const length = Domain.Random.number(0, 100) > 15 ? 1 : 0;
		Array.from({ length }, () => {
			const id = createUniqueId();

			const unitTemplate = Domain.Random.item(groupTypeShoradTemplates);

			if (unitTemplate) {
				shoradGroundUnits.push({
					...unitTemplate,
					id,
					displayName: `${unitTemplate.name}|${id}`,
				});
			}
		});
	}

	return { groundUnits, shoradGroundUnits };
}
