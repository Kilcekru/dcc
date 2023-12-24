import { Building, GenericStructure, UnitCamp } from "../../ecs/entities";
import { store } from "../../ecs/store";
import { StateSerialized } from "./types/entities";

export function serialize() {
	const serialized: StateSerialized = { entities: [] };
	for (const entity of store.entities.values()) {
		if (entity instanceof GenericStructure || entity instanceof Building || entity instanceof UnitCamp) {
			serialized.entities.push(entity.serialize());
		}
	}

	return serialized;
}

self.serialize = serialize;
