import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import fs from "fs-extra";

import * as Domain from "../../domain";

const saveCampaign: Types.Campaign["saveCampaign"] = async (campaign) => {
	return Domain.Persistance.CampaignPersistance.put({
		...campaign,
		edited: new Date(),
	});
};

const resumeCampaign: Types.Campaign["resumeCampaign"] = async () => {
	const list = await Domain.Persistance.CampaignPersistance.list();

	const activeSynopsis = Object.values(list).find((syn) => syn.active);

	if (activeSynopsis == null) {
		return Object.values(list).length > 0 ? undefined : null;
	}
	return await Domain.Persistance.CampaignPersistance.get(activeSynopsis.id);
};

const openCampaign: Types.Campaign["openCampaign"] = async (id) => {
	return Domain.Persistance.CampaignPersistance.get(id);
};

const removeCampaign: Types.Campaign["removeCampaign"] = async (id) => {
	return Domain.Persistance.CampaignPersistance.remove(id);
};

const loadCampaignList: Types.Campaign["loadCampaignList"] = async () => {
	return Domain.Persistance.CampaignPersistance.list();
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

const generateCampaignMission: Types.Campaign["generateCampaignMission"] = async (campaign) => {
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
		if (!Utils.hasKey(e, "code", "string") || e.code !== "ENOENT") {
			// eslint-disable-next-line no-console
			console.warn("load factions", e instanceof Error ? e.message : "unknown error");
		}

		return [];
	}
}

export async function saveCustomFactions(factions: Array<DcsJs.Faction>) {
	try {
		await Domain.Persistance.writeJson({
			schema: DcsJs.Schema.factions,
			name: Domain.Persistance.campaignFactions,
			data: {
				version: 0,
				factions,
			},
		});
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
	saveCampaign,
	resumeCampaign,
	openCampaign,
	removeCampaign,
	loadCampaignList,
	loadMissionState,
	loadFactions,
	saveCustomFactions,
};
