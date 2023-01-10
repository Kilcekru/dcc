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

const getObjectives: Campaign["getObjectives"] = async () => {
	return DcsJs.getObjectives();
};

const getStrikeTargets: Campaign["getStrikeTargets"] = async () => {
	return DcsJs.getStrikeTargets();
};

const generateCampaignMission: Campaign["generateCampaignMission"] = async (campaign: DcsJs.Campaign) => {
	await DcsJs.generateCampaignMission(campaign);

	return { success: true };
};

export const campaign: Campaign = {
	generateCampaignMission,
	getAirdromes,
	getObjectives,
	getStrikeTargets,
	save,
	load,
};
