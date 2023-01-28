import * as DcsJs from "@foxdelta2/dcsjs";

import { getAircraftStateFromFlightGroup, getFlightGroups, Minutes } from "../utils";
import { RunningCampaignState } from "./types";

const findFlightGroupForAircraft = (faction: DcsJs.CampaignFaction, aircraftId: string) => {
	const flightGroups = getFlightGroups(faction.packages);

	return flightGroups.find((fg) => fg.units.some((unit) => unit.id === aircraftId));
};

const updateFactionAircraftState = (faction: DcsJs.CampaignFaction, timer: number) => {
	faction.inventory.aircrafts.forEach((aircraft) => {
		// Is maintenance finished?
		if (
			aircraft.state === "maintenance" &&
			aircraft.maintenanceEndTime != null &&
			aircraft.maintenanceEndTime <= timer
		) {
			aircraft.state = "idle";
			aircraft.maintenanceEndTime = undefined;
		} else if (aircraft.state === "maintenance") {
			return;
		} else {
			const fg = findFlightGroupForAircraft(faction, aircraft.id);

			if (fg == null) {
				if (aircraft.state !== "idle") {
					aircraft.state = "maintenance";
					aircraft.maintenanceEndTime = timer + Minutes(60);
				}

				return;
			}

			const newState = getAircraftStateFromFlightGroup(fg, timer);

			if (newState == null || aircraft.state === newState) {
				return;
			}

			aircraft.state = newState;
		}
	});
};

export const updateAircraftState = (state: RunningCampaignState) => {
	updateFactionAircraftState(state.blueFaction, state.timer);
	updateFactionAircraftState(state.redFaction, state.timer);
};
