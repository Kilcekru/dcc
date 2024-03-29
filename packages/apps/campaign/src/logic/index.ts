import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { cleanupFlightGroups } from "./cleanupFlightGroups";
import { cleanupGroundGroups } from "./cleanupGroundGroup";
import { cleanupInventory } from "./cleanupInventory";
import { cleanupPackages } from "./cleanupPackages";
import { cleanupStructures } from "./cleanupStructures";
import { combatRound } from "./combat";
import { gameOver } from "./gameOver";
import { packagesRound, updatePackagesStateRound } from "./packages";
import { reinforcement } from "./reinforcement";
import { repairStructures } from "./repairStructures";
import { RunningCampaignState } from "./types";
import { updateAircraftState } from "./updateAircraftState";
import { updateAirdromes } from "./updateAirdrome";
import { moveGroundGroups, updateFrontline, updateGroundCombat } from "./updateFrontline";

/**
 *
 * @param state will be mutated
 * @returns
 */
export const campaignRound = (state: DcsJs.CampaignState, dataStore: Types.Campaign.DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	updateAircraftState(state as RunningCampaignState);
	updatePackagesStateRound(state as RunningCampaignState, dataStore);
	moveGroundGroups(state as RunningCampaignState, dataStore);
	combatRound(state as RunningCampaignState, dataStore);
	updateGroundCombat(state as RunningCampaignState, dataStore);

	return state;
};

export const longCampaignRound = (state: DcsJs.CampaignState, dataStore: Types.Campaign.DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	cleanupPackages(state as RunningCampaignState);
	packagesRound(state as RunningCampaignState, dataStore);
	cleanupFlightGroups(state as RunningCampaignState);
	cleanupGroundGroups(state as RunningCampaignState);
	cleanupStructures(state as RunningCampaignState);
	updateFrontline(state as RunningCampaignState, dataStore);
	updateAirdromes(state as RunningCampaignState, dataStore);
	reinforcement(state as RunningCampaignState);
	repairStructures(state as RunningCampaignState);
	cleanupInventory(state as RunningCampaignState);
	gameOver(state as RunningCampaignState);

	return state;
};

export const missionRound = (state: DcsJs.CampaignState, dataStore: Types.Campaign.DataStore) => {
	if (state.blueFaction == null || state.redFaction == null) {
		return state;
	}

	cleanupPackages(state as RunningCampaignState);
	updateAircraftState(state as RunningCampaignState);
	packagesRound(state as RunningCampaignState, dataStore);
	cleanupFlightGroups(state as RunningCampaignState);
	cleanupGroundGroups(state as RunningCampaignState);
	cleanupStructures(state as RunningCampaignState);
	moveGroundGroups(state as RunningCampaignState, dataStore);
	updateFrontline(state as RunningCampaignState, dataStore);
	updateAirdromes(state as RunningCampaignState, dataStore);
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
export * from "./updateDownedPilots";
