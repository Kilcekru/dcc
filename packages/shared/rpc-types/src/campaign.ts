import type * as DcsJs from "@foxdelta2/dcsjs";
// import { z } from "zod";

export type DataStore = {
	map: DcsJs.MapName;
	aircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.DCS.Aircraft>> | undefined;
	groundUnitsTemplates: DcsJs.GetGroundUnitsTemplates | undefined;
	airdromes: DcsJs.GetMapData["airdromes"] | undefined;
	objectives: DcsJs.GetMapData["objectives"] | undefined;
	strikeTargets: DcsJs.GetMapData["strikeTargets"] | undefined;
	samTemplates: DcsJs.GetSamTemplates | undefined;
	vehicles: DcsJs.GetVehicles | undefined;
	structures: DcsJs.GetStructures | undefined;
	callSigns: DcsJs.GetCallSigns | undefined;
	launchers: DcsJs.GetLaunchers | undefined;
	weapons: DcsJs.GetWeapons | undefined;
};

export type MissionState = {
	killed_aircrafts: Array<string>;
	killed_ground_units: Array<string>;
	mission_ended: boolean;
	time: number;
	mission_id: string;
};

export interface Campaign {
	getSamTemplates: () => Promise<DcsJs.GetSamTemplates>;
	getVehicles: () => Promise<DcsJs.GetVehicles>;
	getDataStore: (map: DcsJs.MapName) => Promise<DataStore>;
	generateCampaignMission: (campaign: DcsJs.Campaign) => Promise<{ success: boolean }>;
	save: (campaign: DcsJs.CampaignState) => Promise<{ success: boolean }>;
	load: () => Promise<Partial<DcsJs.CampaignState>>;
	loadMissionState: () => Promise<MissionState | undefined>;
	loadFactions: () => Promise<Array<DcsJs.Faction>>;
	saveCustomFactions: (value: Array<DcsJs.Faction>) => Promise<void>;
	saveCampaign: (campaign: DcsJs.CampaignState) => Promise<void>;
}

/* const structureTypeDefaultEnum = ["Ammo Depot", "Farp", "Command Center", "Power Plant", "Fuel Storage"] as const;
const structureTypeUnitCampEnum = ["Barrack", "Depot"] as const;

export namespace Schema {
	export const coalition = z.enum(["blue", "red", "neutral"]);
	export const aiSkill = z.enum(["Average", "Good", "High", "Excellent"]);
	export const mapName = z.enum(["caucasus", "normandy", "persianGulf", "southAtlantic", "syria"]);
	export const aircraftState = z.enum(["idle", "en route", "on station", "combat", "rtb", "waiting", "maintenance"]);
	export const homeBaseType = z.enum(["airdrome", "farp", "carrier"]);
	export const task = z.enum(["SEAD", "DEAD", "AWACS", "CAP", "Escort", "Pinpoint Strike", "CAS"]);
	export const pylonType = z.enum(["Fuel Tank", "Targeting Pod", "Gun Pod", "ECM Pod", "Other", "Weapon"]);
	export const groundUnitType = z.enum([
		"MBT",
		"Track Radar",
		"Search Radar",
		"SAM Launcher",
		"Unarmored",
		"Armored",
		"IFV",
		"SHORAD",
		"Transport",
		"Power Generator",
		"Refuel",
		"Control Unit",
		"EW",
		"Infantry",
	]);
	export const groundUnitState = z.enum(["idle", "en route", "on objective"]);
	export const groundGroupState = z.enum(["en route", "on objective", "combat"]);
	export const groundGroupType = z.enum(["armor", "mbt", "infantry", "ew"]);
	export const samType = z.enum(["SA-10-300", "SA-6", "SA-5", "SA-3", "SA-2", "Hawk"]);
	export const structureState = z.enum(["active", "destroyed", "deactivated"]);
	export const buildingCategory = z.enum(["Fortifications", "Heliports"]);
	export const structureTypeDefault = z.enum(structureTypeDefaultEnum);
	export const structureTypeUnitCamp = z.enum(structureTypeUnitCampEnum);
	export const structureType = z.enum([...structureTypeDefaultEnum, ...structureTypeUnitCampEnum]);

	export const faction = z.object({
		aircraftTypes: z.record(z.array(z.string())),
		countryName: z.string(),
		name: z.string(),
		year: z.number().optional(),
		playable: z.boolean(),
		templateName: z.string(),
		created: z.coerce.date(),
	});

	export const factions = z.object({
		factions: z.array(faction),
		version: z.number(),
	});

	export const homeBase = z.object({
		type: homeBaseType,
		name: z.string(),
	});

	export const pylon = z.object({
		CLSID: z.string(),
		num: z.number(),
		total: z.number(),
		count: z.number(),
		type: pylonType,
	});

	export const loadout = z.object({
		task: z.union([task, z.literal("default")]),
		name: z.string(),
		displayName: z.string(),
		pylons: z.array(pylon),
	});

	export const aircraft = z.object({
		id: z.string(),
		aircraftType: z.string(),
		state: aircraftState,
		maintenanceEndTime: z.number().optional(),
		a2GWeaponReadyTimer: z.number().optional(),
		a2AWeaponReadyTimer: z.number().optional(),
		availableTasks: z.array(z.string()),
		alive: z.boolean(),
		destroyedTime: z.number().optional(),
		onboardNumber: z.string(),
		homeBase,
		loadout,
	});

	export const groundUnit = z.object({
		id: z.string(),
		name: z.string(),
		displayName: z.string(),
		category: z.string(),
		alive: z.boolean(),
		vehicleTypes: z.array(groundUnitType),
		destroyedTime: z.number().optional(),
		state: groundUnitState,
	});

	export const flightGroupUnit = z.object({
		id: z.string(),
		name: z.string(),
		callSign: z.union([z.number(), z.object({ 1: z.number(), 2: z.number(), 3: z.number(), name: z.string() })]),
		client: z.boolean(),
	});

	export const position = z.object({
		x: z.number(),
		y: z.number(),
	});

	export const waypoint = z.object({
		name: z.string(),
		time: z.number(),
		duration: z.number().optional(),
		speed: z.number(),
		position,
		taskStart: z.boolean().optional(),
		onGround: z.boolean().optional(),
		hold: z.boolean().optional(),
		racetrack: z
			.object({
				position,
				name: z.string(),
				distance: z.number(),
				duration: z.number(),
			})
			.optional(),
	});

	export const objective = z.object({
		name: z.string(),
		position,
		coalition,
		incomingGroundGroups: z.record(coalition, z.string()),
	});

	export const flightGroup = z.object({
		id: z.string(),
		name: z.string(),
		units: z.array(flightGroupUnit),
		task,
		waypoints: z.array(waypoint),
		startTime: z.number(),
		tot: z.number(),
		landingTime: z.number(),
		target: z.string().optional(),
		position,
		airdromeName: z.string(),
	});

	export const flightPackage = z.object({
		id: z.string(),
		startTime: z.number(),
		taskEndTime: z.number(),
		endTime: z.number(),
		task,
		flightGroups: z.array(flightGroup),
		frequency: z.number(),
	});

	export const groundGroup = z.object({
		id: z.string(),
		unitIds: z.array(z.string()),
		position,
		objectiveName: z.string(),
		state: groundGroupState,
		startTime: z.number(),
		startObjectiveName: z.string(),
		type: groundGroupType,
		combatTimer: z.number().optional(),
	});

	export const samGroup = groundGroup.merge(
		z.object({
			type: z.enum(["sam"]),
			range: z.number(),
			operational: z.boolean(),
			fireInterval: z.number(),
			samType,
		})
	);

	export const building = z.object({
		name: z.string(),
		alive: z.boolean(),
		destroyedTime: z.number().optional(),
		repairScore: z.number().optional(),
		offset: position,
		heading: z.number(),
		category: buildingCategory,
		shapeName: z.string(),
		type: z.string(),
	});

	export const structureBase = z.object({
		id: z.string(),
		name: z.string(),
		position,
		objectiveName: z.string(),
		groupId: z.number(),
		buildings: z.array(building),
		state: structureState,
	});

	export const structureDefault = structureBase.merge(
		z.object({
			type: structureTypeDefault,
		})
	);

	export const structureUnitCamp = structureBase.merge(
		z.object({
			type: structureTypeUnitCamp,
			deploymentScore: z.number(),
		})
	);

	export const structure = z.union([structureDefault, structureUnitCamp]);

	export const campaignFaction = faction.merge(
		z.object({
			airdromeNames: z.array(z.string()),
			inventory: z.object({
				aircrafts: z.record(aircraft),
				groundUnits: z.record(groundUnit),
			}),
			packages: z.array(flightPackage),
			groundGroups: z.array(z.union([groundGroup, samGroup])),
			awacsFrequency: z.number(),
			structures: z.record(structure),
		})
	);

	export const campaign = z.object({
		active: z.boolean(),
		loaded: z.boolean(),
		timer: z.number(),
		multiplier: z.number(),
		paused: z.boolean(),
		selectedFlightGroup: flightGroup,
		blueFaction: campaignFaction.optional(),
		redFaction: campaignFaction.optional(),
		winningCondition: z.union([
			z.object({ type: z.literal("ground units") }),
			z.object({ type: z.literal("objective"), value: z.string() }),
		]),
		nextDay: z.boolean(),
		allowNightMissions: z.boolean().optional(),
		toastMessages: z.array(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string().optional(),
				type: z.enum(["error", "info"]),
			})
		),
		campaignTime: z.number(),
		lastTickTimer: z.number(),
		objectives: z.record(objective),
		winner: coalition.optional(),
		aiSkill,
		hardcore: z.union([z.boolean(), z.literal("killed")]).optional(),
		name: z.string(),
		missionId: z.string().optional(),
		map: mapName,
		id: z.string(),
	});
}

export type CampaignState = z.infer<typeof Schema.campaign>;
export type Faction = z.infer<typeof Schema.faction>;
export type CampaignFaction = z.infer<typeof Schema.campaignFaction>;
export type Aircraft = z.infer<typeof Schema.aircraft>;
export type Loadout = z.infer<typeof Schema.loadout>;
export type Task = z.infer<typeof Schema.task>;
export type Structure = z.infer<typeof Schema.structure>;
export type StructureType = z.infer<typeof Schema.structureType>;
export type StructureTypeDefault = z.infer<typeof Schema.structureTypeDefault>;
export type StructureTypeUnitCamp = z.infer<typeof Schema.structureTypeUnitCamp>;
export type StructureUnitCamp = z.infer<typeof Schema.structureUnitCamp>;
export type StructureDefault = z.infer<typeof Schema.structureDefault>;
export type Objective = z.infer<typeof Schema.objective>;
export type GroundGroup = z.infer<typeof Schema.groundGroup>;
export type SamGroup = z.infer<typeof Schema.samGroup>;
export type FlightPackage = z.infer<typeof Schema.flightPackage>;
export type FlightGroup = z.infer<typeof Schema.flightGroup>;
export type Position = z.infer<typeof Schema.position>;

 */
