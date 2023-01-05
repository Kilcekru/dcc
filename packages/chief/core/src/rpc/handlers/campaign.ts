import * as DcsJs from "@foxdelta2/dcsjs";
import { Campaign, CampaignState } from "@kilcekru/dcc-shared-rpc-types";

import { Persistance } from "../../persistance/persistance";

const persistanceState = new Persistance<CampaignState>({ path: "app/campaign" });

const save: Campaign["save"] = async (campaign) => {
	persistanceState.data = campaign;

	await persistanceState.save();

	console.log("save", campaign); // eslint-disable-line no-console

	return { success: true };
};

const load: Campaign["load"] = async () => {
	await persistanceState.load();

	return persistanceState.data;
};

const getAirdromes: Campaign["getAirdromes"] = async () => {
	return DcsJs.getAirdromes();
};

const generateCampaignMission: Campaign["generateCampaignMission"] = async (campaign: DcsJs.Campaign) => {
	DcsJs.generateCampaignMission(campaign);

	return { success: true };
};

export const campaign: Campaign = {
	generateCampaignMission,
	getAirdromes,
	save,
	load,
};
