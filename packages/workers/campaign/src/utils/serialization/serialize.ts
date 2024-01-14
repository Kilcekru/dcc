import * as Types from "@kilcekru/dcc-shared-types";

import { store } from "../../ecs/store";

export function serialize() {
	const serialized: Types.Serialization.StateSerialized = {
		id: store.id,
		name: store.name,
		version: store.version,
		time: store.time,
		theatre: store.theatre,
		active: true,
		factionDefinitions: store.factionDefinitions,
		entities: [],
		campaignParams: store.campaignParams,
	};
	for (const entity of store.entities.values()) {
		serialized.entities.push(
			(entity as unknown as { serialize: () => Types.Serialization.StateEntitySerialized }).serialize(),
		); // TODO
	}

	return serialized;
}

self.serialize = serialize;
