import * as Types from "@kilcekru/dcc-shared-types";
import { useContext } from "solid-js";

import { CampaignContext } from "./components";
import { sendWorkerMessage } from "./worker";

export function useSave() {
	return () => {
		sendWorkerMessage({
			name: "serialize",
		});
	};
}

export function closeCampaign() {
	const [, { reset }] = useContext(CampaignContext);

	reset?.();
	sendWorkerMessage({
		name: "closeCampaign",
	});
}

export async function loadCampaignIntoStore(state: Types.Campaign.WorkerState) {
	sendWorkerMessage({
		name: "load",
		state: state,
	});
}
