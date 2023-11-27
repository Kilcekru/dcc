import { Campaign } from "@kilcekru/dcc-shared-types";

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
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerMessage", e.data);
		}
	}
});
