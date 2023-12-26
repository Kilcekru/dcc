import { store } from "../../ecs/store";
import type { StateEntitySerialized, StateSerialized } from "./types/entities";

export function serialize() {
	const serialized: StateSerialized = {
		id: store.id,
		name: store.name,
		version: store.version,
		time: store.time,
		map: store.map,
		active: true,
		factionDefinitions: store.factionDefinitions,
		entities: [],
	};
	for (const entity of store.entities.values()) {
		serialized.entities.push((entity as unknown as { serialize: () => StateEntitySerialized }).serialize()); // TODO
	}

	return serialized;
}

self.serialize = serialize;
