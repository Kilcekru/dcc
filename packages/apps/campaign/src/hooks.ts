import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";

import { sendWorkerMessage } from "./worker";

export function useSave() {
	return () => {
		sendWorkerMessage({
			name: "serialize",
		});
	};
}

export function closeCampaign() {
	sendWorkerMessage({
		name: "closeCampaign",
	});
}

export async function loadCampaignIntoStore(state: Types.Campaign.WorkerState) {
	const dataStore = await rpc.campaign.getDataStore(state.map);

	sendWorkerMessage({
		name: "setDataStore",
		payload: dataStore,
	});

	sendWorkerMessage({
		name: "load",
		state: state,
	});
}
