import { world } from "../../ecs";
import { GenericStructure } from "../../ecs/entities";
import { StateSerialized } from "./types/entities";

export function serialize() {
	const serialized: StateSerialized = { entities: [] };
	for (const entity of world.entities.values()) {
		if (entity instanceof GenericStructure) {
			serialized.entities.push(entity.serialize());
		}
	}

	return serialized;
}

self.serialize = serialize;
