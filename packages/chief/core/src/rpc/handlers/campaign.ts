import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-rpc-types";
import fs from "fs-extra";

import { Campaign } from "../../domain";
import { campaignState } from "../../persistance";

const save: Types.Campaign["save"] = async (campaign) => {
	campaignState.data = campaign;

	await campaignState.save();

	return { success: true };
};

const load: Types.Campaign["load"] = async () => {
	await campaignState.load();

	return campaignState.data;
};

const getAirdromes: Types.Campaign["getAirdromes"] = async () => {
	return DcsJs.getAirdromes();
};

const getObjectives: Types.Campaign["getObjectives"] = async () => {
	return DcsJs.getObjectives();
};

const getStrikeTargets: Types.Campaign["getStrikeTargets"] = async () => {
	return DcsJs.getStrikeTargets();
};

const getSamTemplates: Types.Campaign["getSamTemplates"] = async () => {
	return DcsJs.getSamTemplates();
};

const getVehicles: Types.Campaign["getVehicles"] = async () => {
	return DcsJs.getVehicles();
};

const getDataStore: Types.Campaign["getDataStore"] = async () => {
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

const generateCampaignMission: Types.Campaign["generateCampaignMission"] = async (campaign: DcsJs.Campaign) => {
	const path = Campaign.getMissionPath();

	if (path == undefined) {
		return { success: false };
	}

	await DcsJs.generateCampaignMission(campaign, path);
	return { success: true };
};

const loadMissionState: Types.Campaign["loadMissionState"] = async () => {
	const path = Campaign.getMissionStatePath();

	if (path == undefined) {
		return undefined;
	}

	return (await fs.readJSON(path)) as Types.MissionState;
};

export const campaign: Types.Campaign = {
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
