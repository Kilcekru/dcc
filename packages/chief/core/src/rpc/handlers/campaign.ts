import * as DcsJs from "@foxdelta2/dcsjs";
import { Campaign, CampaignState, MissionState } from "@kilcekru/dcc-shared-rpc-types";
import fs from "fs-extra";

import { Persistance } from "../../persistance/persistance";
import { misc } from "./misc";

const persistanceState = new Persistance<CampaignState>({ path: "app/campaign" });

const save: Campaign["save"] = async (campaign) => {
	persistanceState.data = campaign;

	await persistanceState.save();

	return { success: true };
};

const load: Campaign["load"] = async () => {
	await persistanceState.load();

	return persistanceState.data;
};

const getAirdromes: Campaign["getAirdromes"] = async () => {
	return DcsJs.getAirdromes();
};

const getObjectives: Campaign["getObjectives"] = async () => {
	return DcsJs.getObjectives();
};

const getStrikeTargets: Campaign["getStrikeTargets"] = async () => {
	return DcsJs.getStrikeTargets();
};

const getSamTemplates: Campaign["getSamTemplates"] = async () => {
	return DcsJs.getSamTemplates();
};

const getVehicles: Campaign["getVehicles"] = async () => {
	return DcsJs.getVehicles();
};

const getDataStore: Campaign["getDataStore"] = async () => {
	return {
		vehicles: DcsJs.getVehicles(),
		airdromes: DcsJs.getAirdromes(),
		aircrafts: DcsJs.getAircrafts(),
		objectives: DcsJs.getObjectives(),
		samTemplates: DcsJs.getSamTemplates(),
		strikeTargets: DcsJs.getStrikeTargets(),
		structures: DcsJs.getStructures(),
		callSigns: DcsJs.getCallSigns(),
		launchers: DcsJs.getLaunchers(),
		weapons: DcsJs.getWeapons(),
	};
};

const generateCampaignMission: Campaign["generateCampaignMission"] = async (campaign: DcsJs.Campaign) => {
	const config = await misc.getUserConfig();

	if (config.dcs?.available) {
		await DcsJs.generateCampaignMission(campaign, config.dcs.paths.savedGames + "/Missions/dcc_mission.miz");

		return { success: true };
	}

	return { success: false };
};

const loadMissionState: Campaign["loadMissionState"] = async () => {
	const config = await misc.getUserConfig();

	if (config.dcs?.available) {
		const file = (await fs.readJSON(config.dcs.paths.savedGames + "/Missions/dcc_state.json")) as MissionState;

		return file;
	} else {
		return undefined;
	}
};

export const campaign: Campaign = {
	generateCampaignMission,
	getAirdromes,
	getObjectives,
	getStrikeTargets,
	getSamTemplates,
	getVehicles,
	getDataStore,
	save,
	load,
	loadMissionState,
};
