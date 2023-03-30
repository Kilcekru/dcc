import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { getLoadoutForAircraftType } from "../utils";

export const updateAircraftForFlightGroup = (
	flightGroup: DcsJs.CampaignFlightGroup,
	faction: DcsJs.CampaignFaction,
	dataStore: DataStore
) => {
	flightGroup.units.forEach((unit) => {
		const aircraft = faction.inventory.aircrafts[unit.id];

		if (aircraft == null) {
			throw "aircraft not found";
		}

		aircraft.state = "waiting";
		aircraft.loadout = getLoadoutForAircraftType(aircraft.aircraftType, flightGroup.task, dataStore);
	});
};
