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

export const campaign: Campaign = {
	save,
	load,
};
