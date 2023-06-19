import { Campaign } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const campaign: Campaign = {
	generateCampaignMission: rpc<Campaign["generateCampaignMission"]>("campaign", "generateCampaignMission"),
	getSamTemplates: rpc<Campaign["getSamTemplates"]>("campaign", "getSamTemplates"),
	getVehicles: rpc<Campaign["getVehicles"]>("campaign", "getVehicles"),
	getDataStore: rpc<Campaign["getDataStore"]>("campaign", "getDataStore"),
	save: rpc<Campaign["save"]>("campaign", "save"),
	load: rpc<Campaign["load"]>("campaign", "load"),
	loadMissionState: rpc<Campaign["loadMissionState"]>("campaign", "loadMissionState"),
};
