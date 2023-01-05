import { Campaign } from "@kilcekru/dcc-shared-rpc-types";

import { executeRpc } from "../utils";

export const campaign: Campaign = {
	generateCampaignMission: (...args: Parameters<Campaign["generateCampaignMission"]>) =>
		executeRpc("campaign", "generateCampaignMission", args) as ReturnType<Campaign["generateCampaignMission"]>,
	getAirdromes: (...args: Parameters<Campaign["getAirdromes"]>) =>
		executeRpc("campaign", "getAirdromes", args) as ReturnType<Campaign["getAirdromes"]>,
	save: (...args: Parameters<Campaign["save"]>) => executeRpc("campaign", "save", args) as ReturnType<Campaign["save"]>,
	load: (...args: Parameters<Campaign["load"]>) => executeRpc("campaign", "load", args) as ReturnType<Campaign["load"]>,
};
