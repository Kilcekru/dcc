import { z } from "zod";

import { entityTypeSchema, queryKeySchema } from "../../types";

// tmp schemas from dcsjs
namespace Schema {
	export const coalition = z.enum(["blue", "red", "neutrals"]);
	export const position = z.object({ x: z.number(), y: z.number() });
	export const task = z.enum(["DEAD", "AWACS", "CAP", "Escort", "Pinpoint Strike", "CAS", "CSAR", "Air Assault"]);
	export const structureType = z.enum([
		"Ammo Depot",
		"Farp",
		"Command Center",
		"Power Plant",
		"Fuel Storage",
		"Hospital",
		"Prison",
		"Barrack",
		"Depot",
	]);
	export const aircraftType = z.enum([
		"Tornado GR4",
		"Tornado IDS",
		"F/A-18A",
		"F/A-18C",
		"F-14A",
		"Tu-22M3",
		"F-4E",
		"B-52H",
		"MiG-27K",
		"Su-27",
		"MiG-23MLD",
		"Su-25",
		"Su-25TM",
		"Su-25T",
		"Su-33",
		"MiG-25PD",
		"MiG-25RBT",
		"Su-30",
		"Su-17M4",
		"MiG-31",
		"Tu-95MS",
		"Su-24M",
		"Su-24MR",
		"Tu-160",
		"F-117A",
		"B-1B",
		"S-3B",
		"S-3B Tanker",
		"Mirage 2000-5",
		"Mirage-F1CE",
		"Mirage-F1EE",
		"F-15C",
		"F-15E",
		"F-15ESE",
		"MiG-29A",
		"MiG-29G",
		"MiG-29S",
		"Tu-142",
		"C-130",
		"An-26B",
		"An-30M",
		"C-17A",
		"A-50",
		"E-3A",
		"IL-78M",
		"E-2C",
		"IL-76MD",
		"F-16C bl.50",
		"F-16C bl.52d",
		"F-16A",
		"F-16A MLU",
		"RQ-1A Predator",
		"Yak-40",
		"KC-135",
		"FW-190D9",
		"FW-190A8",
		"Bf-109K-4",
		"SpitfireLFMkIX",
		"SpitfireLFMkIXCW",
		"P-51D",
		"P-51D-30-NA",
		"P-47D-30",
		"P-47D-30bl1",
		"P-47D-40",
		"MosquitoFBMkVI",
		"Ju-88A4",
		"A-20G",
		"A-4E-C",
		"A-10A",
		"A-10C",
		"A-10C_2",
		"AJS37",
		"AV8BNA",
		"KC130",
		"KC135MPRS",
		"C-101EB",
		"C-101CC",
		"J-11A",
		"JF-17",
		"KJ-2000",
		"WingLoong-I",
		"H-6J",
		"Christen Eagle II",
		"F-16C_50",
		"F-5E",
		"F-5E-3",
		"F-86F Sabre",
		"F-14B",
		"F-14A-135-GR",
		"FA-18C_hornet",
		"Hawk",
		"I-16",
		"L-39C",
		"L-39ZA",
		"M-2000C",
		"MB-339A",
		"MB-339APAN",
		"MQ-9 Reaper",
		"MiG-15bis",
		"MiG-19P",
		"MiG-21Bis",
		"Su-34",
		"TF-51D",
		"Mi-24V",
		"Mi-8MT",
		"Mi-26",
		"Ka-27",
		"UH-60A",
		"UH-60L",
		"CH-53E",
		"CH-47D",
		"SH-3W",
		"AH-64A",
		"AH-64D",
		"AH-1W",
		"SH-60B",
		"UH-1H",
		"Mi-28N",
		"OH-58D",
		"AH-64D_BLK_II",
		"Ka-50",
		"Ka-50_3",
		"Mi-24P",
		"SA342M",
		"SA342L",
		"SA342Mistral",
		"SA342Minigun",
		"VSN_F4B",
		"VSN_F4C",
		"SK-60",
	]);
	export const faction = z.object({
		aircraftTypes: z.record(z.array(aircraftType)),
		countryName: z.string(),
		name: z.string(),
		year: z.number().optional(),
		playable: z.boolean(),
		templateName: z.string(),
		carrierName: z.string().optional(),
		created: z.coerce.date().optional(),
	});
}

const entitySchema = z.object({
	serialized: z.literal(true),
	entityType: entityTypeSchema,
	id: z.string(),
	coalition: Schema.coalition,
	queries: z.array(queryKeySchema),
});
export type EntitySerialized = z.TypeOf<typeof entitySchema>;

const groupSchema = entitySchema.extend({
	position: Schema.position,
});
export type GroupSerialized = z.TypeOf<typeof groupSchema>;

const mapEntitySchema = entitySchema.extend({
	position: Schema.position,
});
export type MapEntitySerialized = z.TypeOf<typeof mapEntitySchema>;

const unitSchema = entitySchema.extend({
	alive: z.boolean(),
});
export type UnitSerialized = z.TypeOf<typeof unitSchema>;

const buildingSchema = unitSchema.extend({
	entityType: z.literal("Building"),
	name: z.string(),
	offset: Schema.position,
});
export type BuildingSerialized = z.TypeOf<typeof buildingSchema>;

const structureSchema = mapEntitySchema.extend({
	name: z.string(),
	structureType: Schema.structureType,
	objectiveId: z.string(),
	buildingIds: z.array(z.string()),
});
export type StructureSerialized = z.TypeOf<typeof structureSchema>;

const genericStructureSchema = structureSchema.extend({
	entityType: z.literal("GenericStructure"),
});
export type GenericStructureSerialized = z.TypeOf<typeof genericStructureSchema>;

const unitCampSchema = structureSchema.extend({
	entityType: z.literal("UnitCamp"),
	deploymentScore: z.number(),
});
export type UnitCampSerialized = z.TypeOf<typeof unitCampSchema>;

const packageSchema = entitySchema.extend({
	entityType: z.literal("Package"),
	task: Schema.task,
	cruiseSpeed: z.number(),
	flightGroupIds: z.array(z.string()),
});
export type PackageSerialized = z.TypeOf<typeof packageSchema>;

const objectiveSchema = entitySchema.extend({
	entityType: z.literal("Objective"),
	name: z.string(),
	position: Schema.position,
	incomingGroundGroupId: z.string().optional(),
});
export type ObjectiveSerialized = z.TypeOf<typeof objectiveSchema>;

export const stateSchema = z.object({
	id: z.string(),
	version: z.number(),
	active: z.boolean(),
	time: z.number(),
	map: z.string(),
	name: z.string(),
	factionDefinitions: z.record(Schema.coalition, Schema.faction.optional()),
	entities: z.array(
		z.discriminatedUnion("entityType", [
			genericStructureSchema,
			unitCampSchema,
			buildingSchema,
			packageSchema,
			objectiveSchema,
		]),
	),
});
export type StateSerialized = z.TypeOf<typeof stateSchema>;
