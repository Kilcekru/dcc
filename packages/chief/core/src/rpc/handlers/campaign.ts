import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-rpc-types";
import fs from "fs-extra";

import * as Domain from "../../domain";
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

const getSamTemplates: Types.Campaign["getSamTemplates"] = async () => {
	return DcsJs.getSamTemplates();
};

const getVehicles: Types.Campaign["getVehicles"] = async () => {
	return DcsJs.getVehicles();
};

const getDataStore: Types.Campaign["getDataStore"] = async (map) => {
	const mapData: DcsJs.GetMapData = DcsJs.getMapData(map);

	return {
		map,
		airdromes: mapData.airdromes,
		objectives: mapData.objectives,
		strikeTargets: mapData.strikeTargets,
		groundUnitsTemplates: DcsJs.GetGroundUnitsTemplates(),
		vehicles: DcsJs.getVehicles(),
		aircrafts: DcsJs.getAircrafts(),
		samTemplates: DcsJs.getSamTemplates(),
		structures: DcsJs.getStructures(),
		callSigns: DcsJs.getCallSigns(),
		launchers: DcsJs.getLaunchers(),
		weapons: DcsJs.getWeapons(),
	};
};

const generateCampaignMission: Types.Campaign["generateCampaignMission"] = async (campaign: DcsJs.Campaign) => {
	const path = Domain.Campaign.getMissionPath();

	if (path == undefined) {
		return { success: false };
	}

	await DcsJs.generateCampaignMission(campaign, path);
	return { success: true };
};

const loadMissionState: Types.Campaign["loadMissionState"] = async () => {
	const path = Domain.Campaign.getMissionStatePath();

	if (path == undefined) {
		return undefined;
	}

	return (await fs.readJSON(path)) as Types.MissionState;
};

export async function loadFactions() {
	try {
		const result = await Domain.Persistance.readJson({
			schema: DcsJs.Schema.factions,
			name: Domain.Persistance.campaignFactions,
		});

		return result.factions;
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn("load factions", e instanceof Error ? e.message : "unknown error");

		return [];
	}
}

export async function saveCustomFactions(factions: Array<DcsJs.Faction>) {
	try {
		await Domain.Persistance.writeJson({
			schema: DcsJs.Schema.factions,
			name: Domain.Persistance.campaignFactions,
			data: {
				version: 1,
				factions,
			},
		});
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn(e instanceof Error ? e.message : "unknown error");
	}
}

export async function saveCampaign(campaign: DcsJs.CampaignState) {
	try {
		await Domain.Persistance.CampaignPersistance.put(campaign);
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn(e instanceof Error ? e.message : "unknown error");
	}
}
export const campaign: Types.Campaign = {
	generateCampaignMission,
	getSamTemplates,
	getVehicles,
	getDataStore,
	save,
	load,
	loadMissionState,
	loadFactions,
	saveCustomFactions,
	saveCampaign,
};
