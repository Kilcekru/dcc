import {
	AirAssaultFlightGroup,
	Aircraft,
	Airdrome,
	Building,
	CapFlightGroup,
	CasFlightGroup,
	DEADFlightGroup,
	EscortFlightGroup,
	GenericStructure,
	GroundGroup,
	GroundUnit,
	Objective,
	Package,
	SAM,
	StrikeFlightGroup,
	Structure,
	UnitCamp,
} from "../../ecs/entities";
import { stateSchema } from "./types/entities";

const entityClasses = {
	AirAssaultFlightGroup,
	Aircraft,
	Airdrome,
	CapFlightGroup,
	CasFlightGroup,
	DEADFlightGroup,
	EscortFlightGroup,
	GenericStructure,
	GroundGroup,
	GroundUnit,
	Objective,
	Package,
	SAM,
	StrikeFlightGroup,
	Structure,
	UnitCamp,
	Building,
};

export function deserialize(serialized: unknown) {
	const parsed = stateSchema.safeParse(serialized);
	if (!parsed.success) {
		// todo: handle invalid data
		// eslint-disable-next-line no-console
		console.error("deserialize: invalid data");
		return;
	}

	const res = [];

	for (const entity of parsed.data.entities) {
		if (entity.entityType === "GenericStructure") {
			const entityClass = entityClasses[entity.entityType];
			res.push(entityClass.deserialize(entity));
		}
		if (entity.entityType === "UnitCamp") {
			const entityClass = entityClasses[entity.entityType];
			res.push(entityClass.deserialize(entity));
		}
		if (entity.entityType === "Building") {
			const entityClass = entityClasses[entity.entityType];
			res.push(entityClass.deserialize(entity));
		}
		if (entity.entityType === "Objective") {
			const entityClass = entityClasses[entity.entityType];
			res.push(entityClass.deserialize(entity));
		}
	}

	// only returned to test on console
	return res;
}

self.deserialize = deserialize;
