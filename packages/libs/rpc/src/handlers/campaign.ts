import { Campaign } from "@kilcekru/dcc-shared-rpc-types";

import { rpc } from "../utils";

export const campaign: Campaign = {
	generateCampaignMission: rpc<Campaign["generateCampaignMission"]>("campaign", "generateCampaignMission"),
	getAirdromes: rpc<Campaign["getAirdromes"]>("campaign", "getAirdromes"),
	save: rpc<Campaign["save"]>("campaign", "save"),
	load: rpc<Campaign["load"]>("campaign", "load"),
};
