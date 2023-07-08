import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { random } from "../../utils";
import { RunningCampaignState } from "../types";
import { getCoalitionFaction, getLoadoutForAircraftType } from "../utils";

export const updateAircraftForFlightGroup = (
	flightGroup: DcsJs.FlightGroup,
	state: RunningCampaignState,
	coalition: DcsJs.CampaignCoalition,
	dataStore: Types.Campaign.DataStore,
) => {
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
};

export function calcFrequency(aircraftType: string | undefined, dataStore: Types.Campaign.DataStore) {
	if (aircraftType == null) {
		return random(310, 343);
	}

	if ((aircraftType as DcsJs.AircraftType) === "MiG-15bis") {
		random(0, 50) * 0.025 + 3.75;
	}

	const aircraftDefinition = dataStore.aircrafts?.[aircraftType as DcsJs.AircraftType];

	return aircraftDefinition?.allowedFrequency == null
		? random(310, 343)
		: random(aircraftDefinition.allowedFrequency[0], aircraftDefinition.allowedFrequency[1]);
}
