import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Config } from "../data";
import * as Domain from "../domain";
import { oppositeCoalition } from "../utils";
import { generateAircraftsForHomeBase } from "./createCampaign/generateAircraftInventory";
import { RunningCampaignState } from "./types";
import { getCoalitionFaction } from "./utils";

function updateCoalitionAirdromes(
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
) {
	const faction = getCoalitionFaction(coalition, state);
	const oppCoalition = oppositeCoalition(coalition);
	const oppFaction = getCoalitionFaction(oppCoalition, state);

	faction.airdromeNames.map((name) => {
		const airdrome = dataStore.airdromes?.[name];

		if (airdrome == null) {
			// eslint-disable-next-line no-console
			console.warn("updateCoalitionAirdromes: airdrome not found: " + name);

			return;
		}

		const objectiveInRange = Domain.Location.findInside(
			Object.values(state.objectives),
			airdrome,
			(obj) => obj.position,
			Config.structureRange.airdrome,
		);

		let coalitionCount = 0;
		let oppCoalitionCount = 0;

		objectiveInRange.forEach((obj) => (obj.coalition === coalition ? coalitionCount++ : oppCoalitionCount++));

		if (coalitionCount === 0 && oppCoalitionCount > 0) {
			// eslint-disable-next-line no-console
			console.log("airdrome captured");

			faction.airdromeNames = faction.airdromeNames.filter((n) => n !== name);
			Object.values(faction.inventory.aircrafts).forEach((ac) => {
				const iac = faction.inventory.aircrafts[ac.id];

				if (iac == null || iac.homeBase.name !== name) {
					return;
				}

				iac.disabled = true;
			});

			const homeBase: DcsJs.CampaignHomeBase = { type: "airdrome", name };

			const newAircrafts = generateAircraftsForHomeBase(oppFaction, homeBase, dataStore, false, false);

			newAircrafts.forEach((ac) => {
				oppFaction.inventory.aircrafts[ac.id] = ac;
			});

			oppFaction.airdromeNames.push(name);
		}
	});
}

export function updateAirdromes(state: RunningCampaignState, dataStore: Types.Campaign.DataStore) {
	updateCoalitionAirdromes("blue", state, dataStore);
	updateCoalitionAirdromes("red", state, dataStore);
}
