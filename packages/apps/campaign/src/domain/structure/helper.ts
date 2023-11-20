import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Config } from "../../data";

export function isCampaignStructureUnitCamp(
	structure: DcsJs.Structure | undefined,
): structure is DcsJs.StructureUnitCamp {
	return (structure as DcsJs.StructureUnitCamp).deploymentScore != null;
}

export function getHomeBaseFromName(name: string, faction: DcsJs.CampaignFaction, dataStore: Types.Campaign.DataStore) {
	const airdromes = dataStore.airdromes ?? {};
	const airdrome = airdromes[name];

	// Hombase is not a airdrome
	if (airdrome == null) {
		const shipGroup = faction.shipGroups?.find((grp) => grp.name === name);

		// Homebase is not a ship
		if (shipGroup == null) {
			const farp = Object.values(faction.structures).find((str) => str.name === name);

			return farp;
		}
	}

	return airdrome;
}

export function getAirAssaultReadyBarracks(faction: DcsJs.CampaignFaction) {
	return Object.values(faction.structures)
		.filter((str) => str.type === "Barrack" && str.deploymentScore >= Config.deploymentScore.frontline.barrack * 0.75)
		.map((str) => str as DcsJs.StructureUnitCamp);
}
