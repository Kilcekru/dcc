import "./utils/serialization";

import { Campaign } from "@kilcekru/dcc-shared-types";

import { Entities, world } from "./ecs";
import { getEntity, reset, store } from "./ecs/store";
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
			if (store.id === "") {
				// eslint-disable-next-line no-console
				console.warn("Cannot serialize empty campaign");
				return;
			}
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
			// eslint-disable-next-line no-console
			console.log("load store", e.data.state);
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
		case "closeCampaign": {
			if (store.id === "") {
				// eslint-disable-next-line no-console
				console.warn("Cannot close empty campaign");
				return;
			}

			const state = Serialization.serialize();
			postEvent({
				name: "serialized",
				state: {
					...state,
					active: false,
					factionDefinitions: store.factionDefinitions,
					map: store.map,
				},
			});

			reset();

			break;
		}
		case "setClient": {
			const flightGroup = getEntity<Entities.FlightGroup>(e.data.payload.flightGroupId);

			flightGroup.setClient(e.data.payload.count);

			world.stateUpdate();

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
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerMessage", e.data);
		}
	}
});
