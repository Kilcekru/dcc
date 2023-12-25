import { Building, GenericStructure, Objective, UnitCamp } from "../../ecs/entities";
import { store } from "../../ecs/store";
import { StateSerialized } from "./types/entities";

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
		if (
			entity instanceof GenericStructure ||
			entity instanceof Building ||
			entity instanceof UnitCamp ||
			entity instanceof Objective
		) {
			serialized.entities.push(entity.serialize());
		}
	}

	return serialized;
}

self.serialize = serialize;
