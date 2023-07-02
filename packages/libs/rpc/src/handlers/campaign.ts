import { Campaign } from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const campaign: Campaign = {
	generateCampaignMission: rpc<Campaign["generateCampaignMission"]>("campaign", "generateCampaignMission"),
	getSamTemplates: rpc<Campaign["getSamTemplates"]>("campaign", "getSamTemplates"),
	getVehicles: rpc<Campaign["getVehicles"]>("campaign", "getVehicles"),
	getDataStore: rpc<Campaign["getDataStore"]>("campaign", "getDataStore"),
	saveCampaign: rpc<Campaign["saveCampaign"]>("campaign", "saveCampaign"),
	resumeCampaign: rpc<Campaign["resumeCampaign"]>("campaign", "resumeCampaign"),
	openCampaign: rpc<Campaign["openCampaign"]>("campaign", "openCampaign"),
	loadCampaignList: rpc<Campaign["loadCampaignList"]>("campaign", "loadCampaignList"),
	loadMissionState: rpc<Campaign["loadMissionState"]>("campaign", "loadMissionState"),
	loadFactions: rpc<Campaign["loadFactions"]>("campaign", "loadFactions"),
	saveCustomFactions: rpc<Campaign["saveCustomFactions"]>("campaign", "saveCustomFactions"),
	removeCampaign: rpc<Campaign["removeCampaign"]>("campaign", "removeCampaign"),
};
