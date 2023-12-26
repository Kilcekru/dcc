import "./utils/serialization";

import { Campaign } from "@kilcekru/dcc-shared-types";

import { world } from "./ecs";
import { store } from "./ecs/store";
import { postEvent } from "./events";
import { pauseTicker, resumeTicker } from "./ticker";
import { Serialization } from "./utils";

addEventListener("message", (e: MessageEvent<Campaign.WorkerMessage>) => {
	switch (e.data.name) {
		case "resume": {
			resumeTicker(e.data.payload);
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
		case "serialize": {
			const state = Serialization.serialize();
			postEvent({
				name: "serialized",
				state: {
					...state,
					factionDefinitions: store.factionDefinitions,
					map: store.map,
				},
			});

			break;
		}
		case "load": {
			// reset();
			store.id = e.data.state.id;
			store.version = e.data.state.version;
			store.name = e.data.state.name;
			store.time = e.data.state.time;
			store.map = e.data.state.map;
			store.factionDefinitions = e.data.state.factionDefinitions;
			Serialization.deserialize(e.data.state);

			world.mapUpdate();
			world.stateUpdate();

			break;
		}
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerMessage", e.data);
		}
	}
});
