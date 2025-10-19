import { onEvent } from "@kilcekru/dcc-lib-rpc";

import { campaignStore } from "./stores/campaign";
import { routerStore } from "./stores/router";
import { sendWorkerMessage } from "./worker";

export function registerRpcEventListeners() {
	onEvent("menu.campaign.new", () => {
		sendWorkerMessage({
			name: "closeCampaign",
		});
		campaignStore.trigger.reset();
		routerStore.trigger.push({ path: "create" });
	});
	onEvent("menu.campaign.open", () => {
		sendWorkerMessage({
			name: "closeCampaign",
		});
		campaignStore.trigger.reset();
		routerStore.trigger.push({ path: "open" });
	});
}
