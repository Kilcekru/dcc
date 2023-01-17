import { Campaign } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const campaign: Campaign = {
	generateCampaignMission: rpc<Campaign["generateCampaignMission"]>("campaign", "generateCampaignMission"),
	getAirdromes: rpc<Campaign["getAirdromes"]>("campaign", "getAirdromes"),
	getObjectives: rpc<Campaign["getObjectives"]>("campaign", "getObjectives"),
	getStrikeTargets: rpc<Campaign["getStrikeTargets"]>("campaign", "getStrikeTargets"),
	getSamTemplates: rpc<Campaign["getSamTemplates"]>("campaign", "getSamTemplates"),
	getVehicles: rpc<Campaign["getVehicles"]>("campaign", "getVehicles"),
	save: rpc<Campaign["save"]>("campaign", "save"),
	load: rpc<Campaign["load"]>("campaign", "load"),
};
