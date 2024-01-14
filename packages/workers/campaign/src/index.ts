import "./utils/serialization";

import * as DcsJs from "@foxdelta2/dcsjs";
import { Campaign } from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

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
					theatre: store.theatre,
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
			store.theatre = e.data.state.theatre;
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
					theatre: store.theatre,
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
					theatre: store.theatre,
				},
			});

			break;
		}
		case "skipToNextDay": {
			const d = Utils.DateTime.timerToDate(store.time);
			d.setUTCDate(d.getUTCDate() + 1);
			d.setUTCHours(DcsJs.Theatres[store.theatre].info.night.endHour);
			d.setUTCMinutes(0);
			d.setUTCSeconds(0);

			store.time = Utils.DateTime.dateToTimer(d);

			for (const pkg of store.queries.packages["blue"]) {
				pkg.destructor();
			}
			for (const pkg of store.queries.packages["red"]) {
				pkg.destructor();
			}

			break;
		}
		default: {
			// eslint-disable-next-line no-console
			console.warn("Unhandled WorkerMessage", e.data);
		}
	}
});
