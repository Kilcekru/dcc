import { Campaign } from "@kilcekru/dcc-shared-types";

import { world } from "./ecs";
import { pauseTicker, resumeTicker } from "./ticker";

addEventListener("message", (e: MessageEvent<Campaign.WorkerMessage>) => {
	switch (e.data.name) {
		case "resume": {
			resumeTicker();
			break;
		}
		case "pause": {
			pauseTicker();
			break;
		}
		case "setDataStore": {
			world.setDataStore(e.data.payload);
			break;
		}
		case "generate": {
			world.generate(e.data.payload);
			break;
		}
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerMessage", e.data);
		}
	}
});
