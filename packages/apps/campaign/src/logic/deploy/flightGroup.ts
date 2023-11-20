import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { RunningCampaignState } from "../types";
import { getCoalitionFaction, getLoadoutForAircraftType } from "../utils";

function updateInventory(
	flightGroup: DcsJs.FlightGroup,
	state: RunningCampaignState,
	coalition: DcsJs.Coalition,
	dataStore: Types.Campaign.DataStore,
) {
	const faction = getCoalitionFaction(coalition, state);

	flightGroup.units.forEach((unit) => {
		const aircraft = faction.inventory.aircrafts[unit.id];

		if (aircraft == null) {
			throw new Error("aircraft not found: " + unit.id);
		}

		aircraft.state = "waiting";
		aircraft.loadout = getLoadoutForAircraftType(
			aircraft.aircraftType as DcsJs.AircraftType,
			flightGroup.task,
			dataStore,
		);
	});
}

export function flightGroups(
	groups: Array<DcsJs.FlightGroup>,
	state: RunningCampaignState,
	coalition: DcsJs.Coalition,
	dataStore: Types.Campaign.DataStore,
) {
	groups.forEach((flightGroup) => {
		updateInventory(flightGroup, state, coalition, dataStore);
	});
}
