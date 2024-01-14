import * as DcsJs from "@foxdelta2/dcsjs";
import * as DcsJSSave from "@foxdelta2/dcsjs/save";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import FS from "fs-extra";

import * as Domain from "../../domain";

const saveCampaign: Types.Rpc.Campaign["saveCampaign"] = async (campaign) => {
	return Domain.Persistance.CampaignPersistance.put({
		...campaign,
		edited: new Date(),
		time: campaign.time ?? 0,
		countryName: campaign.factionDefinitions.blue?.countryName ?? "",
		factionName: campaign.factionDefinitions.blue?.name ?? "",
	});
};

const resumeCampaign: Types.Rpc.Campaign["resumeCampaign"] = async (version) => {
	const list = await Domain.Persistance.CampaignPersistance.list();

	const activeSynopsis = Object.values(list).find((syn) => syn.active && (syn.version ?? 0) >= version);

	if (activeSynopsis == null) {
		return Object.values(list).length > 0 ? undefined : null;
	}
	return await Domain.Persistance.CampaignPersistance.get(activeSynopsis.id);
};

const openCampaign: Types.Rpc.Campaign["openCampaign"] = async (id) => {
	return Domain.Persistance.CampaignPersistance.get(id);
};

const removeCampaign: Types.Rpc.Campaign["removeCampaign"] = async (id) => {
	return Domain.Persistance.CampaignPersistance.remove(id);
};

const loadCampaignList: Types.Rpc.Campaign["loadCampaignList"] = async () => {
	return Domain.Persistance.CampaignPersistance.list();
};

const generateCampaignMission: Types.Rpc.Campaign["generateCampaignMission"] = async (_) => {
	const path = Domain.Campaign.getMissionPath();

	if (path == undefined) {
		return { success: false };
	}

	// const kneeboards = await Domain.Campaign.generateBriefingKneeboards(campaign); TODO

	const mission = new DcsJs.Mission({
		date: new Date(),
		startTime: 32400,
		theatre: "Caucasus",
		weather: {
			cloudCover: 0,
			cloudCoverData: [],
			offset: 0,
			temperature: 0,
			wind: {
				direction: 0,
				speed: 0,
			},
		},
		aiSkill: "Average",
		airdromes: {
			blue: new Set("Kobuleti"),
			red: new Set("Gudauta"),
			neutrals: new Set(),
		},
	});

	await DcsJSSave.save(mission, path);

	return { success: true };
};

const loadMissionState: Types.Rpc.Campaign["loadMissionState"] = async () => {
	const path = Domain.Campaign.getMissionStatePath();

	if (path == undefined) {
		return undefined;
	}

	return (await FS.readJSON(path)) as Types.Campaign.MissionState;
};

export async function loadFactions() {
	try {
		const result = await Domain.Persistance.readJson({
			schema: Types.Persistance.Schema.factions,
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

export async function saveCustomFactions(factions: Array<Types.Campaign.Faction>) {
	try {
		await Domain.Persistance.writeJson({
			schema: Types.Persistance.Schema.factions,
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

export const campaign: Types.Rpc.Campaign = {
	generateCampaignMission,
	saveCampaign,
	resumeCampaign,
	openCampaign,
	removeCampaign,
	loadCampaignList,
	loadMissionState,
	loadFactions,
	saveCustomFactions,
};
