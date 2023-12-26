import {
	AirAssaultFlightGroup,
	Aircraft,
	Airdrome,
	Building,
	CapFlightGroup,
	CasFlightGroup,
	DeadFlightGroup,
	EscortFlightGroup,
	GenericStructure,
	GroundGroup,
	GroundUnit,
	Objective,
	Package,
	SeadFlightGroup,
	StrikeFlightGroup,
	UnitCamp,
} from "../../ecs/entities";
import { stateSchema } from "./types/entities";

const entityClasses = {
	AirAssaultFlightGroup,
	Aircraft,
	Airdrome,
	CapFlightGroup,
	CasFlightGroup,
	DeadFlightGroup,
	EscortFlightGroup,
	GenericStructure,
	GroundGroup,
	GroundUnit,
	Objective,
	Package,
	SeadFlightGroup,
	StrikeFlightGroup,
	UnitCamp,
	Building,
};

export function deserialize(serialized: unknown) {
	const parsed = stateSchema.safeParse(serialized);
	if (!parsed.success) {
		// todo: handle invalid data
		// eslint-disable-next-line no-console
		console.error("deserialize: invalid data", parsed.error);
		return;
	}

	const res = [];

	for (const entity of parsed.data.entities) {
		const entityClass = entityClasses[entity.entityType] as { deserialize: (entity: unknown) => void }; // TODO
		res.push(entityClass.deserialize(entity));
	}

	// only returned to test on console
	return res;
}

self.deserialize = deserialize;
