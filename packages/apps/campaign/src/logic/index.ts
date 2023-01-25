import { CampaignState, DataStore } from "@kilcekru/dcc-shared-rpc-types";

import { cleanupPackages } from "./cleanupPackages";
import { packagesTick } from "./packagesTick";
import { RunningCampaignState } from "./types";
import { updateAircraftState } from "./updateAircraftState";

/**
 *
 * @param state will be mutated
 * @returns
 */
export const campaignRound = (state: CampaignState, dataStore: DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	state = cleanupPackages(state as RunningCampaignState);
	state = updateAircraftState(state as RunningCampaignState);
	state = packagesTick(state as RunningCampaignState, dataStore);

	return state;
};
