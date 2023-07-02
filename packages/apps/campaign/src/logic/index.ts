import type * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-types";

import { cleanupFlightGroups } from "./cleanupFlightGroups";
import { cleanupGroundGroups } from "./cleanupGroundGroup";
import { cleanupPackages } from "./cleanupPackages";
import { cleanupStructures } from "./cleanupStructures";
import { combatRound } from "./combat";
import { gameOver } from "./gameOver";
import { packagesRound } from "./packages";
import { reinforcement } from "./reinforcement";
import { repairStructures } from "./repairStructures";
import { RunningCampaignState } from "./types";
import { updateAircraftState } from "./updateAircraftState";
import { updateFrontline } from "./updateFrontline";

/**
 *
 * @param state will be mutated
 * @returns
 */
export const campaignRound = (state: DcsJs.CampaignState, dataStore: DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	cleanupPackages(state as RunningCampaignState);
	updateAircraftState(state as RunningCampaignState);
	packagesRound(state as RunningCampaignState, dataStore);
	combatRound(state as RunningCampaignState);
	cleanupFlightGroups(state as RunningCampaignState);
	cleanupGroundGroups(state as RunningCampaignState);
	cleanupStructures(state as RunningCampaignState);
	updateFrontline(state as RunningCampaignState, dataStore);
	reinforcement(state as RunningCampaignState);
	repairStructures(state as RunningCampaignState);
	gameOver(state as RunningCampaignState);

	return state;
};

export const missionRound = (state: DcsJs.CampaignState, dataStore: DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	cleanupPackages(state as RunningCampaignState);
	updateAircraftState(state as RunningCampaignState);
	packagesRound(state as RunningCampaignState, dataStore);
	cleanupFlightGroups(state as RunningCampaignState);
	cleanupGroundGroups(state as RunningCampaignState);
	cleanupStructures(state as RunningCampaignState);
	updateFrontline(state as RunningCampaignState, dataStore);
	reinforcement(state as RunningCampaignState);
	repairStructures(state as RunningCampaignState);
	gameOver(state as RunningCampaignState);

	return state;
};

export * from "./clearPackages";
export * from "./contextHelper";
export * from "./createCampaign";
export * from "./deploymentScoreUpdate";
export * from "./repairScoreUpdate";
