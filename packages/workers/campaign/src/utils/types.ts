import { z } from "zod";

// entityType
export const entityTypeSchema = z.enum([
	"AirAssaultFlightGroup",
	"Aircraft",
	"Airdrome",
	"CapFlightGroup",
	"CasFlightGroup",
	"DeadFlightGroup",
	"SeadFlightGroup",
	"EscortFlightGroup",
	"GenericStructure",
	"GroundGroup",
	"GroundUnit",
	"Objective",
	"Package",
	"SAM",
	"StrikeFlightGroup",
	"Structure",
	"UnitCamp",
	"Building",
]);
export type EntityType = z.TypeOf<typeof entityTypeSchema>;

// queryName
export const queryNameSchema = z.enum([
	"airdromes",
	"packages",
	"flightGroups",
	"groundGroups",
	"aircrafts",
	"groundUnits",
	"structures",
	"unitCamps",
	"SAMs",
	"mapEntities",
	"objectives",
	"buildings",
]);
export type QueryName = z.TypeOf<typeof queryNameSchema>;

// queryKey
export const queryKeySchema = z.custom<QueryName | `${QueryName}-${string}`>((val) => {
	if (typeof val !== "string") {
		return false;
	}
	const [name] = val.split("-", 2);
	return queryNameSchema.safeParse(name).success;
});
export type QueryK = z.TypeOf<typeof queryKeySchema>;

declare global {
	interface WorkerGlobalScope {
		serialize: () => unknown;
		deserialize: (serialized: unknown) => unknown;
		store: unknown;
		resetStore: () => void;
		world: unknown;
	}
}
