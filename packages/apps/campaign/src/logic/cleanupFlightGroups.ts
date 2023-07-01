import type * as DcsJs from "@foxdelta2/dcsjs";

import { RunningCampaignState } from "./types";

const cleanupFactionFlightGroups = (faction: DcsJs.CampaignFaction) => {
	faction.packages.forEach((pkg) => {
		pkg.flightGroups = pkg.flightGroups.filter((fg) => {
			const hasAliveAircrafts = fg.units.some((unit) => {
				const aircraft = faction.inventory.aircrafts[unit.id];
				return aircraft?.alive;
			});

			return hasAliveAircrafts;
		});
	});
};

export const cleanupFlightGroups = (state: RunningCampaignState) => {
	cleanupFactionFlightGroups(state.blueFaction);
	cleanupFactionFlightGroups(state.redFaction);
};
