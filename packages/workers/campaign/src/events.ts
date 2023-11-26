import { Campaign } from "@kilcekru/dcc-shared-types";

export function postEvent(event: Campaign.WorkerEvent) {
	postMessage(event);
}
