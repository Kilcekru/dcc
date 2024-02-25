import * as DcsJs from "@foxdelta2/dcsjs";
import { z } from "zod";

import type * as Serialization from "./serialization";

export namespace Schema {
	export const campaignSynopsis = z.object({
		id: z.string(),
		factionName: z.string().optional(),
		active: z.boolean(),
		name: z.string(),
		countryName: z.string().optional(),
		// created: z.coerce.date(),
		edited: z.coerce.date(),
		time: z.number(),
		version: z.number().optional(),
	});

	export const faction = z.object({
		aircraftTypes: z.record(z.array(DcsJs.aircraftType)),
		countryName: DcsJs.countryName,
		name: z.string(),
		year: z.number().optional(),
		playable: z.boolean(),
		templateName: z.string(),
		carrierName: z.string().optional(),
		created: z.coerce.date().optional(),
	});

	export const scenarioCoalition = z.object({
		airdromeNames: z.array(z.string()),
		carrierObjective: z.string().optional(),
	});

	export const scenario = z.object({
		theatre: DcsJs.theatre,
		id: z.string(),
		available: z.boolean(),
		name: z.string(),
		era: DcsJs.era,
		date: z.string(),
		briefing: z.string(),
		"blue-start-objective-range": z.tuple([z.number(), z.number()]),
		"win-condition": z.union([
			z.object({
				type: z.literal("ground units"),
			}),
			z.object({
				type: z.literal("objective"),
				value: z.string(),
			}),
		]),
		blue: scenarioCoalition,
		red: scenarioCoalition,
	});

	export const campaignParams = z.object({
		aiSkill: DcsJs.aiSkill,
		hardcore: z.union([z.boolean(), z.literal("killed")]),
		training: z.boolean(),
		nightMissions: z.boolean(),
		badWeather: z.boolean(),
	});

	export const campaignTask = z.enum([
		"CAP",
		"CAS",
		"AWACS",
		"Pinpoint Strike",
		"DEAD",
		"CSAR",
		"Escort",
		"Air Assault",
		"SEAD",
	]);

	export const campaignGroundGroupType = z.enum(["armor", "mbt", "infantry", "ew", "sam"]);
	export const campaignGroundUnitType = z.union([campaignGroundGroupType, z.literal("shorad")]);

	export const campaignPylon = z.union([
		DcsJs.Schema.pylon.extend({
			type: DcsJs.launcherType.extract(["Weapon"]),
			count: z.number(),
			total: z.number(),
			weapon: DcsJs.Schema.weapon.optional(),
		}),
		DcsJs.Schema.pylon.extend({
			type: DcsJs.launcherType.exclude(["Weapon"]),
			count: z.number(),
			total: z.number(),
		}),
	]);

	export const campaignLoadout = z.object({
		task: z.union([DcsJs.task, z.literal("default")]),
		name: z.string(),
		displayName: z.string(),
		pylons: z.array(campaignPylon),
	});

	export const structureTypeUnitCamp = z.enum(["Barrack", "Depot"]);

	export const missionState = z.object({
		missionId: z.string(),
		missionEnded: z.boolean(),
		crashedAircrafts: z.array(z.string()),
		destroyedGroundUnits: z.array(z.string()),
		groupPositions: z.record(DcsJs.coalition, z.array(z.object({ name: z.string(), x: z.number(), y: z.number() }))),
	});
}

export type CampaignSynopsis = z.infer<typeof Schema.campaignSynopsis>;
export type Faction = z.infer<typeof Schema.faction>;
export type CampaignParams = z.infer<typeof Schema.campaignParams>;
export type Scenario = z.infer<typeof Schema.scenario>;
export type CampaignTask = z.infer<typeof Schema.campaignTask>;
export type CampaignGroundGroupType = z.infer<typeof Schema.campaignGroundGroupType>;
export type CampaignGroundGroupUnitType = z.infer<typeof Schema.campaignGroundGroupType>;
export type CampaignPylon = z.infer<typeof Schema.campaignPylon>;
export type CampaignLoadout = z.infer<typeof Schema.campaignLoadout>;
export type StructureTypeUnitCamp = z.infer<typeof Schema.structureTypeUnitCamp>;
export type MissionState = z.infer<typeof Schema.missionState>;

export interface BriefingDocument {
	package: Serialization.PackageSerialized;
	flightGroup: Serialization.FlightGroupSerialized;
	theatre: DcsJs.Theatre;
	entities: Map<Id, Serialization.StateEntitySerialized>;
}

export type StructurePlan = {
	structureName: string;
	structureType: string;
};
export type ObjectivePlan = {
	objectiveName: string;
	structures: Array<StructurePlan>;
	groundUnitTypes: Array<string>;
};

export type DynamicObjectivePlan = ObjectivePlan & { objective: DcsJs.Objective };

export type GroundUnitCategory = CampaignGroundGroupUnitType | "shorad";

export type Id = string;

export interface MapItemBase {
	id: Id;
	name: string;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}
export interface StructureMapItem extends MapItemBase {
	type: "structure";
	structureType: DcsJs.StructureType;
}

export interface AirdromeMapItem extends MapItemBase {
	type: "airdrome";
}

export interface FlightGroupMapItem extends MapItemBase {
	type: "flightGroup";
	task: DcsJs.Task;
}

export interface GroundGroupMapItem extends MapItemBase {
	type: "groundGroup";
	groundGroupType: CampaignGroundGroupUnitType;
}

export interface SAMMapItem extends MapItemBase {
	type: "sam";
	range: number;
	active: boolean;
}

export type MapItem = StructureMapItem | AirdromeMapItem | FlightGroupMapItem | GroundGroupMapItem | SAMMapItem;

export type ObjectiveItem = {
	id: string;
	name: string;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
	incomingGroundGroup: Id | undefined;
};

export type EntityItem = {
	id: string;
	coalition: DcsJs.Coalition;
};

export type AircraftItem = EntityItem & {
	aircraftType: DcsJs.AircraftType;
	homeBaseId: Id;
	flightGroupId: Id | undefined;
	displayName: string;
	isClient: boolean;
};

export type WaypointItem = {
	name: string;
	position: DcsJs.Position;
	onGround: boolean;
	duration: number | undefined;
};

export type FlightplanItem = Array<WaypointItem>;

export type FlightGroupItem = EntityItem & {
	startTime: number;
	task: DcsJs.Task;
	name: string;
	aircrafts: Array<AircraftItem>;
	flightplan: FlightplanItem;
};

export type GroundUnitItem = EntityItem & {
	name: string;
	alive: boolean;
	category: GroundUnitCategory;
};

export type GroundGroupItem = EntityItem & {
	name: string;
	start: string;
	target: string;
	units: Array<GroundUnitItem>;
	shoradUnits: Array<GroundUnitItem>;
	type: CampaignGroundGroupUnitType;
};

export type BuildingItem = {
	name: string;
	alive: boolean;
	offset: DcsJs.Position;
};

export type StructureItem = EntityItem & {
	name: string;
	objective: string;
	structureType: DcsJs.StructureType;
	buildings: Array<BuildingItem>;
};

export type WorkerMessage =
	| { name: "resume"; payload: { multiplier: number } }
	| { name: "pause" }
	| {
			name: "generate";
			payload: {
				blueFactionDefinition: Faction;
				redFactionDefinition: Faction;
				scenario: Scenario;
				campaignParams: CampaignParams;
			};
	  }
	| {
			name: "serialize";
	  }
	| {
			name: "skipToNextDay";
	  }
	| {
			name: "load";
			state: WorkerState;
	  }
	| {
			name: "closeCampaign";
	  }
	| {
			name: "setClient";
			payload: {
				flightGroupId: Id;
				count: number;
			};
	  }
	| {
			name: "getMapUpdate";
	  }
	| {
			name: "submitMissionState";
			payload: MissionState;
	  };

export type WorkerState = {
	id: string;
	name: string;
	time: number;
	entities: object[];
	active: boolean;
	version: number;
	factionDefinitions: Record<DcsJs.Coalition, Faction | undefined>;
	theatre: DcsJs.Theatre;
};

export type WorkerEventTick = { name: "tick"; dt: number };
export type WorkerEventMapUpdate = {
	name: "mapUpdate";
	items: Map<string, MapItem>;
};
export type WorkerEventTimeUpdate = { name: "timeUpdate"; time: number };
export type WorkerEventStateUpdate = { name: "stateUpdate"; state: Serialization.UIState };
export type WorkerEventSerialized = { name: "serialized"; state: WorkerState };
export type WorkerEventLoadFailed = { name: "loadFailed" };

export type WorkerEvent =
	| WorkerEventTick
	| WorkerEventMapUpdate
	| WorkerEventTimeUpdate
	| WorkerEventStateUpdate
	| WorkerEventSerialized
	| WorkerEventLoadFailed;
