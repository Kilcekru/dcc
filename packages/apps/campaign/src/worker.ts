import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Campaign } from "@kilcekru/dcc-shared-types";
import * as Types from "@kilcekru/dcc-shared-types";

import { campaignStore } from "./stores/campaign";
const worker = new Worker("./worker.js");

worker.addEventListener("message", (e: MessageEvent<Campaign.WorkerEvent>) => {
	switch (e.data.name) {
		case "stateUpdate": {
			const uiState = e.data.state;
			campaignStore.trigger.update({ uiState });
			// start the serialization process to save the campaign
			sendWorkerMessage({
				name: "serialize",
			});
			break;
		}
		case "serialized": {
			const uiState = e.data.state;
			// eslint-disable-next-line no-console
			console.log("saveCampaign", uiState);
			void rpc.campaign
				.saveCampaign(uiState)
				// eslint-disable-next-line no-console
				.catch((e) => console.error(e instanceof Error ? e.message : "unknown error"));
			break;
		}
		case "timeUpdate": {
			campaignStore.trigger.updateTime({ time: e.data.time });
			break;
		}
		case "mapUpdate":
		case "loadFailed": {
			// handled in onWorkerEvent
			break;
		}
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerEvent", e.data);
		}
	}
});

export function onWorkerEvent<Event extends Campaign.WorkerEvent>(name: Event["name"], cb: (event: Event) => void) {
	const listener = (e: MessageEvent<Campaign.WorkerEvent>) => {
		if (e.data.name === name) {
			cb(e.data as Event);
		}
	};
	worker.addEventListener("message", listener);
	return { dispose: () => worker.removeEventListener("message", listener) };
}
export function sendWorkerMessage(msg: Campaign.WorkerMessage) {
	worker.postMessage(msg);
}

export const Triggers = {
	// calls a updates of the map entities
	getMapUpdate: () =>
		sendWorkerMessage({
			name: "getMapUpdate",
		}),
	// load the campaign state in the campaign logic worker
	load: (state: Types.Campaign.WorkerState) =>
		sendWorkerMessage({
			name: "load",
			state,
		}),
	resume: (multiplier: number) =>
		sendWorkerMessage({
			name: "resume",
			payload: {
				multiplier: multiplier,
			},
		}),
	pause: () =>
		sendWorkerMessage({
			name: "pause",
		}),
};
