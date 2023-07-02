import * as Types from "@kilcekru/dcc-shared-types";

import { rpc } from "../utils";

export const campaign: Types.Rpc.Campaign = {
	generateCampaignMission: rpc<Types.Rpc.Campaign["generateCampaignMission"]>("campaign", "generateCampaignMission"),
	getSamTemplates: rpc<Types.Rpc.Campaign["getSamTemplates"]>("campaign", "getSamTemplates"),
	getVehicles: rpc<Types.Rpc.Campaign["getVehicles"]>("campaign", "getVehicles"),
	getDataStore: rpc<Types.Rpc.Campaign["getDataStore"]>("campaign", "getDataStore"),
	saveCampaign: rpc<Types.Rpc.Campaign["saveCampaign"]>("campaign", "saveCampaign"),
	resumeCampaign: rpc<Types.Rpc.Campaign["resumeCampaign"]>("campaign", "resumeCampaign"),
	openCampaign: rpc<Types.Rpc.Campaign["openCampaign"]>("campaign", "openCampaign"),
	loadCampaignList: rpc<Types.Rpc.Campaign["loadCampaignList"]>("campaign", "loadCampaignList"),
	loadMissionState: rpc<Types.Rpc.Campaign["loadMissionState"]>("campaign", "loadMissionState"),
	loadFactions: rpc<Types.Rpc.Campaign["loadFactions"]>("campaign", "loadFactions"),
	saveCustomFactions: rpc<Types.Rpc.Campaign["saveCustomFactions"]>("campaign", "saveCustomFactions"),
	removeCampaign: rpc<Types.Rpc.Campaign["removeCampaign"]>("campaign", "removeCampaign"),
};
