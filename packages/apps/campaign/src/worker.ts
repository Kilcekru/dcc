import { Campaign } from "@kilcekru/dcc-shared-types";

const worker = new Worker("./worker.js");

worker.addEventListener("message", (e: MessageEvent<Campaign.WorkerEvent>) => {
	switch (e.data.name) {
		case "tick": {
			// eslint-disable-next-line no-console
			console.log("tick", e.data);
			break;
		}
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerEvent", e.data);
		}
	}
});

export function sendWorkerMessage(msg: Campaign.WorkerMessage) {
	worker.postMessage(msg);
}
