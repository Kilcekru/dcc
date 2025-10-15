import * as DcsJSSave from "@foxdelta2/dcsjs/save";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import FS from "fs-extra";

import * as Domain from "../../../domain";
import { createMission } from "./generateMission";

const saveCampaign: Types.Rpc.Campaign["saveCampaign"] = async (campaign) => {
	return Domain.Persistance.CampaignPersistance.put({
		...campaign,
		edited: new Date(),
		time: campaign.time ?? 0,
		countryName: campaign.factionDefinitions.blue?.countryName ?? "",
		factionName: campaign.factionDefinitions.blue?.name ?? "",
		opponentCountryName: campaign.factionDefinitions.red?.countryName ?? "",
		opponentFactionName: campaign.factionDefinitions.red?.name ?? "",
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

const generateCampaignMission: Types.Rpc.Campaign["generateCampaignMission"] = async (campaign) => {
	const path = Domain.Campaign.getMissionPath();
	const entityMap = new Map(campaign.entities.map((entity) => [entity.id, entity]));
	const getEntity = Utils.ECS.EntitySelector(entityMap);

	if (path == undefined) {
		return { success: false };
	}

	const mission = await createMission(campaign, getEntity);
	const kneeboards = await Domain.Campaign.generateBriefingKneeboards(campaign, entityMap);

	await DcsJSSave.save({ mission, path, kneeboards });

	return { success: true };
};

const loadMissionState: Types.Rpc.Campaign["loadMissionState"] = async () => {
	const path = Domain.Campaign.getMissionStatePath();

	if (path == undefined) {
		return undefined;
	}

	const jsonContent = (await FS.readJSON(path)) as unknown;

	return Types.Campaign.Schema.missionState.parse(jsonContent);
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
