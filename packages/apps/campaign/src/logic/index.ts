import { CampaignState, DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { cleanupFlightGroups } from "./cleanupFlightGroups";
import { cleanupPackages } from "./cleanupPackages";
import { combatRound } from "./combat";
import { packagesRound } from "./packages";
import { RunningCampaignState } from "./types";
import { updateAircraftState } from "./updateAircraftState";
import { updateFrontline } from "./updateFrontline";

/**
 *
 * @param state will be mutated
 * @returns
 */
export const campaignRound = (state: CampaignState, dataStore: DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	cleanupPackages(state as RunningCampaignState);
	updateAircraftState(state as RunningCampaignState);
	packagesRound(state as RunningCampaignState, dataStore);
	combatRound(state as RunningCampaignState);
	cleanupFlightGroups(state as RunningCampaignState);
	updateFrontline(state as RunningCampaignState);

	return state;
};

export * from "./contextHelper";
export * from "./createCampaign";
