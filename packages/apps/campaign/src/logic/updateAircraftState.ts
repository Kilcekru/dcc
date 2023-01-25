import * as DcsJs from "@foxdelta2/dcsjs";

import { calcFlightGroupPosition, getAircraftStateFromFlightGroup, getFlightGroups } from "../utils";
import { RunningCampaignState } from "./types";

const findFlightGroupForAircraft = (faction: DcsJs.CampaignFaction, aircraftId: string) => {
	const flightGroups = getFlightGroups(faction.packages);

	return flightGroups.find((fg) => fg.units.some((unit) => unit.aircraftId === aircraftId));
};

const updateFactionAircraftState = (faction: DcsJs.CampaignFaction, timer: number) => {
	const aircrafts = faction.inventory.aircrafts.map((aircraft) => {
		if (
			aircraft.state === "maintenance" &&
			aircraft.maintenanceEndTime != null &&
			aircraft.maintenanceEndTime <= timer
		) {
			return {
				...aircraft,
				state: "idle",
				maintenanceEndTime: undefined,
			} as DcsJs.CampaignAircraft;
		} else if (aircraft.state === "en route" || aircraft.state === "rtb") {
			const fg = findFlightGroupForAircraft(faction, aircraft.id);

			if (fg == null) {
				return aircraft;
			}

			const position = calcFlightGroupPosition(fg, timer, 170);

			if (position == null) {
				return aircraft;
			}

			return { ...aircraft, position };
		} else {
			return aircraft;
		}
	});

	const aircraftState: Record<string, DcsJs.CampaignAircraftState | undefined> = faction.packages.reduce(
		(prev, pkg) => {
			return {
				...prev,
				...pkg.flightGroups.reduce((prev, fg) => {
					const states: Record<string, string | undefined> = {};
					fg.units.forEach((unit) => {
						states[unit.aircraftId] = getAircraftStateFromFlightGroup(fg, timer);
					});
					return { ...prev, ...states };
				}, {}),
			};
		},
		{}
	);

	return aircrafts.map((aircraft) => ({
		...aircraft,
		state: aircraftState[aircraft.id] ?? aircraft.state,
	}));
};

export const updateAircraftState = (state: RunningCampaignState) => {
	state.blueFaction.inventory.aircrafts = updateFactionAircraftState(state.blueFaction, state.timer);
	state.redFaction.inventory.aircrafts = updateFactionAircraftState(state.redFaction, state.timer);

	return state;
};
