import type * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "../domain";
import { getAircraftStateFromFlightGroup, getFlightGroups } from "../utils";
import { RunningCampaignState } from "./types";

const findFlightGroupForAircraft = (faction: DcsJs.CampaignFaction, aircraftId: string) => {
	const flightGroups = getFlightGroups(faction.packages);

	return flightGroups.find((fg) => fg.units.some((unit) => unit.id === aircraftId));
};

const updateFactionAircraftState = (faction: DcsJs.CampaignFaction, timer: number) => {
	Object.values(faction.inventory.aircrafts).forEach(({ id }) => {
		const aircraft = faction.inventory.aircrafts[id];

		if (aircraft == null) {
			return;
		}

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
					aircraft.maintenanceEndTime = timer + Domain.Time.Minutes(40);
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
