import * as DcsJs from "@foxdelta2/dcsjs";
import { z } from "zod";

import * as Campaign from "./campaign";

namespace Schema {
	export const groundUnitType = z.enum([
		"2B11 mortar",
		"SAU Gvozdika",
		"SAU Msta",
		"SAU Akatsia",
		"SAU 2-C9",
		"M-109",
		"SpGH_Dana",
		"AAV7",
		"BMD-1",
		"BMP-1",
		"BMP-2",
		"BMP-3",
		"BRDM-2",
		"BTR_D",
		"Cobra",
		"LAV-25",
		"M1043 HMMWV Armament",
		"M1045 HMMWV TOW",
		"M1126 Stryker ICV",
		"M-113",
		"M1134 Stryker ATGM",
		"M-2 Bradley",
		"MCV-80",
		"MTLB",
		"Marder",
		"TPZ",
		"Grad_FDDM",
		"Bunker",
		"Paratrooper RPG-16",
		"Paratrooper AKS-74",
		"Infantry AK Ins",
		"Sandbox",
		"Soldier AK",
		"Infantry AK",
		"Soldier M249",
		"Soldier M4",
		"Soldier M4 GRG",
		"Soldier RPG",
		"MLRS FDDM",
		"Infantry AK ver2",
		"Infantry AK ver3",
		"Grad-URAL",
		"Uragan_BM-27",
		"Smerch",
		"Smerch_HE",
		"MLRS",
		"2S6 Tunguska",
		"Kub 2P25 ln",
		"5p73 s-125 ln",
		"S-300PS 5P85C ln",
		"S-300PS 5P85D ln",
		"SA-11 Buk LN 9A310M1",
		"Osa 9A33 ln",
		"Tor 9A331",
		"Strela-10M3",
		"Strela-1 9P31",
		"SA-11 Buk CC 9S470M1",
		"Patriot AMG",
		"Patriot ECS",
		"Gepard",
		"Hawk pcp",
		"Vulcan",
		"Hawk ln",
		"M48 Chaparral",
		"M6 Linebacker",
		"Patriot ln",
		"M1097 Avenger",
		"Patriot EPP",
		"Patriot cp",
		"Roland ADS",
		"S-300PS 54K6 cp",
		"Soldier stinger",
		"Stinger comm dsr",
		"Stinger comm",
		"ZSU-23-4 Shilka",
		"ZU-23 Emplacement Closed",
		"ZU-23 Emplacement",
		"Ural-375 ZU-23",
		"ZU-23 Closed Insurgent",
		"Ural-375 ZU-23 Insurgent",
		"ZU-23 Insurgent",
		"SA-18 Igla manpad",
		"SA-18 Igla comm",
		"SA-18 Igla-S manpad",
		"SA-18 Igla-S comm",
		"Igla manpad INS",
		"1L13 EWR",
		"Kub 1S91 str",
		"S-300PS 40B6M tr",
		"S-300PS 40B6MD sr",
		"55G6 EWR",
		"S-300PS 64H6E sr",
		"SA-11 Buk SR 9S18M1",
		"Dog Ear radar",
		"Hawk tr",
		"Hawk sr",
		"Patriot str",
		"Hawk cwar",
		"p-19 s-125 sr",
		"Roland Radar",
		"snr s-125 tr",
		"house1arm",
		"house2arm",
		"outpost_road",
		"outpost",
		"houseA_arm",
		"TACAN_beacon",
		"Challenger2",
		"Leclerc",
		"M-60",
		"M1128 Stryker MGS",
		"M-1 Abrams",
		"T-55",
		"T-72B",
		"T-80UD",
		"T-90",
		"Leopard1A3",
		"Merkava_Mk4",
		"Ural-4320 APA-5D",
		"ATMZ-5",
		"ATZ-10",
		"GAZ-3307",
		"GAZ-3308",
		"GAZ-66",
		"M978 HEMTT Tanker",
		"HEMTT TFFT",
		"IKARUS Bus",
		"KAMAZ Truck",
		"LAZ Bus",
		"LiAZ Bus",
		"Hummer",
		"M 818",
		"MAZ-6303",
		"Predator GCS",
		"Predator TrojanSpirit",
		"Suidae",
		"Tigr_233036",
		"Trolley bus",
		"UAZ-469",
		"Ural ATsP-6",
		"Ural-4320-31",
		"Ural-4320T",
		"Ural-375 PBU",
		"Ural-375",
		"VAZ Car",
		"ZiL-131 APA-80",
		"SKP-11",
		"ZIL-131 KUNG",
		"ZIL-4331",
		"KrAZ6322",
		"JTAC",
		"Infantry Animated",
		"Electric locomotive",
		"Locomotive",
		"Coach cargo",
		"Coach cargo open",
		"Coach a tank blue",
		"Coach a tank yellow",
		"Coach a passenger",
		"Coach a platform",
		"tacr2a",
		"LARC-V",
		"KS-19",
		"SON_9",
		"Scud_B",
		"HL_DSHK",
		"HL_KORD",
		"tt_DSHK",
		"tt_KORD",
		"HL_ZU-23",
		"tt_ZU-23",
		"HL_B8M1",
		"tt_B8M1",
		"NASAMS_Radar_MPQ64F1",
		"NASAMS_Command_Post",
		"NASAMS_LN_B",
		"NASAMS_LN_C",
		"M4_Sherman",
		"M2A1_halftrack",
		"FPS-117 Dome",
		"FPS-117 ECS",
		"FPS-117",
		"BTR-80",
		"RD_75",
		"S_75M_Volhov",
		"SNR_75V",
		"RLS_19J6",
		"RPC_5N62V",
		"S-200_Launcher",
		"ZSU_57_2",
		"S-60_Type59_Artillery",
		"generator_5i57",
		"T-72B3",
		"PT_76",
		"BTR-82A",
		"ATZ-5",
		"AA8",
		"TZ-22_KrAZ",
		"ATZ-60_Maz",
		"ZIL-135",
		"S_75_ZIL",
		"rapier_fsa_launcher",
		"rapier_fsa_optical_tracker_unit",
		"rapier_fsa_blindfire_radar",
		"bofors40",
		"Chieftain_mk3",
		"Bedford_MWD",
		"Land_Rover_101_FC",
		"Land_Rover_109_S3",
		"hy_launcher",
		"Silkworm_SR",
		"ES44AH",
		"Boxcartrinity",
		"Tankcartrinity",
		"Wellcarnsc",
		"flak18",
		"Pz_IV_H",
		"Leopard-2A5",
		"Leopard-2",
		"leopard-2A4",
		"leopard-2A4_trs",
		"Sd_Kfz_251",
		"Blitz_36-6700A",
		"T155_Firtina",
		"VAB_Mephisto",
		"ZTZ96B",
		"ZBD04A",
		"HQ-7_LN_SP",
		"HQ-7_LN_EO",
		"HQ-7_STR_SP",
		"PLZ05",
		"TYPE-59",
		"M45_Quadmount",
		"M1_37mm",
	]);

	export const samType = z.enum(["SA-10-300", "SA-6", "SA-5", "SA-3", "SA-2", "Hawk"]);
}
export type GroundUnitType = z.infer<typeof Schema.groundUnitType>; // TODO

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
export type QueryKey = z.TypeOf<typeof queryKeySchema>;

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
	"Flightplan",
]);
export type EntityType = z.TypeOf<typeof entityTypeSchema>;

const entitySchema = z.object({
	serialized: z.literal(true),
	entityType: entityTypeSchema,
	id: z.string(),
	coalition: DcsJs.coalition,
	queries: z.array(queryKeySchema),
});
export type EntitySerialized = z.TypeOf<typeof entitySchema>;

const mapEntitySchema = entitySchema.extend({
	name: z.string(),
	position: DcsJs.Schema.position,
	hidden: z.boolean(),
});
export type MapEntitySerialized = z.TypeOf<typeof mapEntitySchema>;

const groupSchema = mapEntitySchema.extend({
	position: DcsJs.Schema.position,
});
export type GroupSerialized = z.TypeOf<typeof groupSchema>;

const groundGroupSchema = groupSchema.extend({
	entityType: z.literal("GroundGroup"),
	startId: z.string(),
	targetId: z.string(),
	type: Campaign.Schema.campaignGroundGroupType,
	unitIds: z.array(z.string()),
	shoradUnitIds: z.array(z.string()),
	embarkedOntoFlightGroupId: z.string().optional(),
});
export type GroundGroupSerialized = z.TypeOf<typeof groundGroupSchema>;

const samSchema = groupSchema.extend({
	entityType: z.literal("SAM"),
	type: Schema.samType,
	objectiveId: z.string(),
	unitIds: z.array(z.string()),
	active: z.boolean(), // ui
});
export type SAMSerialized = z.TypeOf<typeof samSchema>;

const waypointTypeSchema = z.enum(["TakeOff", "Landing", "Task", "Nav", "Hold"]);
export type WaypointType = z.TypeOf<typeof waypointTypeSchema>;

const waypointTemplateSchema = z.object({
	name: z.string(),
	position: DcsJs.Schema.position,
	onGround: z.boolean(),
	duration: z.number().optional(),
	type: waypointTypeSchema,
	raceTrack: z
		.object({
			name: z.string(),
			position: DcsJs.Schema.position,
		})
		.optional(),
});
export type WaypointTemplateSerialized = z.TypeOf<typeof waypointTemplateSchema>;

const waypointSchema = waypointTemplateSchema.extend({
	flightplanId: z.string(),
	arrivalDuration: z.number(),
});
export type WaypointSerialized = z.TypeOf<typeof waypointSchema>;

const flightplanSchema = entitySchema.extend({
	entityType: z.literal("Flightplan"),
	flightGroupId: z.string(),
	waypoints: z.array(waypointSchema),
});
export type FlightplanSerialized = z.TypeOf<typeof flightplanSchema>;

const flightGroupState = z.enum(["waiting", "start up", "in air", "landed", "destroyed"]);
export type FlightGroupState = z.TypeOf<typeof flightGroupState>;

const flightGroupSchema = groupSchema.extend({
	aircraftIds: z.array(z.string()),
	task: DcsJs.task,
	startTime: z.number(), // ui
	name: z.string(),
	homeBaseId: z.string(),
	combat: z
		.object({
			type: z.enum(["a2a"]),
			targetId: z.string(),
			cooldownTime: z.number(),
		})
		.optional(),
	packageId: z.string(),
	flightplanId: z.string(),
	state: flightGroupState, // ui
	hasClients: z.boolean(), // ui
});
export type FlightGroupSerialized = z.TypeOf<typeof flightGroupSchema>;

const escortedFlightGroupSchema = flightGroupSchema.extend({
	escortFlightGroupId: z.record(DcsJs.task, z.string()).optional(),
});
export type EscortedFlightGroupSerialized = z.TypeOf<typeof escortedFlightGroupSchema>;

const escortingFlightGroupSchema = flightGroupSchema.extend({
	targetFlightGroupId: z.string(),
});
export type EscortingFlightGroupSerialized = z.TypeOf<typeof escortingFlightGroupSchema>;

const airAssaultFlightGroupSchema = flightGroupSchema.extend({
	entityType: z.literal("AirAssaultFlightGroup"),
	targetGroundGroupId: z.string(),
	embarkedGroundGroupId: z.string().optional(),
});
export type AirAssaultFlightGroupSerialized = z.TypeOf<typeof airAssaultFlightGroupSchema>;

const capFlightGroupSchema = flightGroupSchema.extend({
	entityType: z.literal("CapFlightGroup"),
	targetHomeBaseId: z.string(),
});
export type CapFlightGroupSerialized = z.TypeOf<typeof capFlightGroupSchema>;

const casFlightGroupSchema = escortedFlightGroupSchema.extend({
	entityType: z.literal("CasFlightGroup"),
	targetGroundGroupId: z.string(),
});
export type CasFlightGroupSerialized = z.TypeOf<typeof casFlightGroupSchema>;

const deadFlightGroupSchema = escortedFlightGroupSchema.extend({
	entityType: z.literal("DeadFlightGroup"),
	targetSAMId: z.string(),
});
export type DeadFlightGroupSerialized = z.TypeOf<typeof deadFlightGroupSchema>;

const seadFlightGroupSchema = escortingFlightGroupSchema.extend({
	entityType: z.literal("SeadFlightGroup"),
});
export type SeadFlightGroupSerialized = z.TypeOf<typeof seadFlightGroupSchema>;

const escortFlightGroupSchema = escortingFlightGroupSchema.extend({
	entityType: z.literal("EscortFlightGroup"),
});
export type EscortFlightGroupSerialized = z.TypeOf<typeof escortFlightGroupSchema>;

const strikeFlightGroupSchema = escortedFlightGroupSchema.extend({
	entityType: z.literal("StrikeFlightGroup"),
	targetStructureId: z.string(),
});
export type StrikeFlightGroupSerialized = z.TypeOf<typeof strikeFlightGroupSchema>;

const unitSchema = entitySchema.extend({
	alive: z.boolean(),
});
export type UnitSerialized = z.TypeOf<typeof unitSchema>;

const buildingSchema = unitSchema.extend({
	entityType: z.literal("Building"),
	name: z.string(),
	buildingType: DcsJs.buildingType,
	offset: DcsJs.Schema.position,
	repairScore: z.number().optional(),
	repairCost: z.number(), // ui
});
export type BuildingSerialized = z.TypeOf<typeof buildingSchema>;

const callSignSchema = z.object({
	"1": z.number(),
	"2": z.number(),
	"3": z.number(),
	name: z.string(),
});
export type CallSign = z.TypeOf<typeof callSignSchema>;

const aircraftSchema = unitSchema.extend({
	entityType: z.literal("Aircraft"),
	aircraftType: DcsJs.aircraftType,
	flightGroupId: z.string().optional(),
	callSign: callSignSchema.optional(),
	name: z.string().optional(),
	homeBaseId: z.string(),
	isClient: z.boolean(),
	loadout: Campaign.Schema.campaignLoadout.optional(),
});
export type AircraftSerialized = z.TypeOf<typeof aircraftSchema>;

const groundUnitSchema = unitSchema.extend({
	name: z.string(),
	entityType: z.literal("GroundUnit"),
	category: Campaign.Schema.campaignGroundUnitType,
	type: Schema.groundUnitType,
});

export type GroundUnitSerialized = z.TypeOf<typeof groundUnitSchema>;

const structureSchema = mapEntitySchema.extend({
	name: z.string(),
	structureType: DcsJs.structureType,
	objectiveId: z.string(),
	buildingIds: z.array(z.string()),
	active: z.boolean(),
});
export type StructureSerialized = z.TypeOf<typeof structureSchema>;

const genericStructureSchema = structureSchema.extend({
	entityType: z.literal("GenericStructure"),
});
export type GenericStructureSerialized = z.TypeOf<typeof genericStructureSchema>;

const unitCampSchema = structureSchema.extend({
	entityType: z.literal("UnitCamp"),
	deploymentScore: z.number(),
	deploymentCost: z.number(), // ui
	hasPower: z.boolean(), // ui
	hasFuel: z.boolean(), // ui
	hasAmmo: z.boolean(), // ui
});
export type UnitCampSerialized = z.TypeOf<typeof unitCampSchema>;

const packageSchema = entitySchema.extend({
	entityType: z.literal("Package"),
	task: DcsJs.task,
	cruiseSpeed: z.number(),
	startTime: z.number(),
	flightGroupIds: z.array(z.string()),
	frequency: z.number(),
});
export type PackageSerialized = z.TypeOf<typeof packageSchema>;

const objectiveSchema = entitySchema.extend({
	entityType: z.literal("Objective"),
	name: z.string(),
	position: DcsJs.Schema.position,
	incomingGroundGroupId: z.string().optional(),
});
export type ObjectiveSerialized = z.TypeOf<typeof objectiveSchema>;

const homeBaseSchema = mapEntitySchema.extend({
	name: z.string(),
	type: z.enum(["airdrome", "carrier", "farp"]),
	aircraftIds: z.array(z.string()),
});
export type HomeBaseSerialized = z.TypeOf<typeof homeBaseSchema>;

const airdromeSchema = homeBaseSchema.extend({
	entityType: z.literal("Airdrome"),
	frequencyList: z.array(z.number()),
});
export type AirdromeSerialized = z.TypeOf<typeof airdromeSchema>;

export const stateEntitySchema = z.discriminatedUnion("entityType", [
	genericStructureSchema,
	unitCampSchema,
	buildingSchema,
	packageSchema,
	objectiveSchema,
	aircraftSchema,
	airAssaultFlightGroupSchema,
	deadFlightGroupSchema,
	escortFlightGroupSchema,
	strikeFlightGroupSchema,
	casFlightGroupSchema,
	capFlightGroupSchema,
	seadFlightGroupSchema,
	airdromeSchema,
	groundGroupSchema,
	groundUnitSchema,
	flightplanSchema,
	samSchema,
]);
export type StateEntitySerialized = z.TypeOf<typeof stateEntitySchema>;

export const stateSchema = z.object({
	id: z.string(),
	version: z.number(),
	active: z.boolean(),
	time: z.number(),
	theatre: z.string(),
	name: z.string(),
	campaignParams: Campaign.Schema.campaignParams,
	factionDefinitions: z.record(DcsJs.coalition, Campaign.Schema.faction.optional()),
	entities: z.array(stateEntitySchema),
});
export type StateSerialized = z.TypeOf<typeof stateSchema>;
