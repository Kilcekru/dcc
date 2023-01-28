import * as DcsJs from "@foxdelta2/dcsjs";

import { RunningCampaignState } from "./types";

const cleanupFactionPackages = (faction: DcsJs.CampaignFaction, timer: number) => {
	// Remove a package if the end time is in the past
	faction.packages = faction.packages.some((pkg) => pkg.endTime <= timer)
		? faction.packages.filter((pkg) => pkg.endTime > timer)
		: faction.packages;

	// Remove a package if it has no flight groups left
	faction.packages = faction.packages.some((pkg) => pkg.flightGroups.length === 0)
		? faction.packages.filter((pkg) => pkg.flightGroups.length > 0)
		: faction.packages;
};

export const cleanupPackages = (state: RunningCampaignState) => {
	cleanupFactionPackages(state.blueFaction, state.timer);

	cleanupFactionPackages(state.redFaction, state.timer);
};
