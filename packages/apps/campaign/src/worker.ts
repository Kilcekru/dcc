import { Campaign } from "@kilcekru/dcc-shared-types";

const worker = new Worker("./worker.js");

worker.addEventListener("message", (e: MessageEvent<Campaign.WorkerEvent>) => {
	switch (e.data.name) {
		case "tick": {
			// eslint-disable-next-line no-console
			console.log("tick", e.data);
			break;
		}
		case "mapUpdate": {
			// eslint-disable-next-line no-console
			console.log("mapUpdate", e.data);
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
