import * as DcsJs from "@foxdelta2/dcsjs";

import { Minutes } from "../utils";
import { RunningCampaignState } from "./types";

const cleanupFactionPackages = (faction: DcsJs.CampaignFaction, timer: number) => {
	const finishedPackages = faction.packages.filter((pkg) => pkg.endTime <= timer);

	const usedAircraftIds = finishedPackages.reduce((prev, pkg) => {
		const fgAircraftIds = pkg.flightGroups.reduce((prev, fg) => {
			return [...prev, ...fg.units.map((unit) => unit.aircraftId)];
		}, [] as Array<string>);

		return [...prev, ...fgAircraftIds];
	}, [] as Array<string>);

	const updatedAircrafts = faction.inventory.aircrafts.map((aircraft) => {
		if (usedAircraftIds.some((id) => aircraft.id === id)) {
			return {
				...aircraft,
				state: "maintenance",
				maintenanceEndTime: timer + Minutes(60),
			} as DcsJs.CampaignAircraft;
		} else {
			return aircraft;
		}
	});

	const updatedPackages = faction.packages.filter((pkg) => pkg.endTime > timer);

	return {
		aircrafts: updatedAircrafts,
		packages: updatedPackages,
	};
};

export const cleanupPackages = (state: RunningCampaignState) => {
	const blueUpdate = cleanupFactionPackages(state.blueFaction, state.timer);

	state.blueFaction.inventory.aircrafts = blueUpdate.aircrafts;
	state.blueFaction.packages = blueUpdate.packages;

	const redUpdate = cleanupFactionPackages(state.redFaction, state.timer);

	state.redFaction.inventory.aircrafts = redUpdate.aircrafts;
	state.redFaction.packages = redUpdate.packages;

	return state;
};
