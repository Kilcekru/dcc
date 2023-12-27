import type * as DcsJs from "@foxdelta2/dcsjs";
import { z } from "zod";

import { FlightGroupSerialized, StateEntitySerialized } from "./ecs";

export type DataStore = {
	map: DcsJs.MapName;
	aircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.DCS.Aircraft>> | undefined;
	groundUnitsTemplates: DcsJs.GetGroundUnitsTemplates | undefined;
	airdromes: DcsJs.GetMapData["airdromes"] | undefined;
	objectives: DcsJs.GetMapData["objectives"] | undefined;
	strikeTargets: DcsJs.GetMapData["strikeTargets"] | undefined;
	mapInfo: DcsJs.GetMapData["info"] | undefined;
	samTemplates: DcsJs.GetSamTemplates | undefined;
	vehicles: DcsJs.GetVehicles | undefined;
	structures: DcsJs.GetStructures | undefined;
	callSigns: DcsJs.GetCallSigns | undefined;
	launchers: DcsJs.GetLaunchers | undefined;
	weapons: DcsJs.GetWeapons | undefined;
	ships: DcsJs.GetShips | undefined;
	tasks: DcsJs.GetTasks | undefined;
};

export type MissionState = {
	killed_aircrafts: Array<string>;
	killed_ground_units: Array<string>;
	mission_ended: boolean;
	downed_pilots: Array<{
		name: string;
		coalition: number;
		time: number;
		x: number;
		y: number;
	}>;
	group_positions: Array<{
		name: string;
		x: number;
		y: number;
	}>;
	time: number;
	mission_id: string;
};

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
}

export type CampaignSynopsis = z.infer<typeof Schema.campaignSynopsis>;

export interface BriefingDocument {
	package: DcsJs.FlightPackage;
	flightGroup: DcsJs.FlightGroup;
	faction: DcsJs.CampaignFaction;
	dataAircrafts: Partial<Record<DcsJs.AircraftType, DcsJs.DCS.Aircraft>>;
	mapData: DcsJs.MapData;
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

export type DynamicObjectivePlan = ObjectivePlan & { objective: DcsJs.Import.Objective };

export type ScenarioCoalition = {
	airdromeNames: Array<string>;
	carrierObjective?: string;
	objectivePlans: Array<ObjectivePlan>;
};
export type Scenario = {
	map: string;
	id: string;
	available: boolean;
	name: string;
	era: string;
	date: string;
	briefing: string;
	"blue-start-objective-range": [number, number];
	"win-condition":
		| {
				type: "ground units";
		  }
		| {
				type: "objective";
				value: string;
		  };
	blue: ScenarioCoalition;
	red: ScenarioCoalition;
};

export type GroundUnitCategory = DcsJs.CampaignGroundGroupType | "shorad";

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
	groundGroupType: DcsJs.CampaignGroundGroupType;
}

export interface MapEntityMapItem extends MapItemBase {
	type: "unknown";
}

export type MapItem = MapItemBase;

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
	type: DcsJs.CampaignGroundGroupType;
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
	state: DcsJs.StructureState;
	buildings: Array<BuildingItem>;
};

export type WorkerMessage =
	| { name: "resume"; payload: { multiplier: number } }
	| { name: "pause" }
	| {
			name: "generate";
			payload: {
				blueFactionDefinition: DcsJs.Faction;
				redFactionDefinition: DcsJs.Faction;
				scenario: Scenario;
			};
	  }
	| {
			name: "setDataStore";
			payload: DataStore;
	  }
	| {
			name: "serialize";
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
	  };

export type WorkerState = {
	id: string;
	name: string;
	time: number;
	entities: object[];
	active: boolean;
	version: number;
	factionDefinitions: Record<DcsJs.Coalition, DcsJs.Faction | undefined>;
	map: DcsJs.MapName;
};

export type UIState = {
	id: string;
	name: string;
	time: number;
	timeMultiplier: number;
	flightGroups: Array<FlightGroupSerialized>;
	entities: Map<Id, StateEntitySerialized>;
};

export type WorkerEventTick = { name: "tick"; dt: number };
export type WorkerEventMapUpdate = { name: "mapUpdate"; items: Map<string, MapItem>; map: DcsJs.MapName };
export type WorkerEventTimeUpdate = { name: "timeUpdate"; time: number };
export type WorkerEventStateUpdate = { name: "stateUpdate"; state: UIState };
export type WorkerEventBlueFlightGroupsUpdate = { name: "blueFlightGroupsUpdate"; items: Set<FlightGroupItem> };
export type WorkerEventSerialized = { name: "serialized"; state: WorkerState };

export type WorkerEvent =
	| WorkerEventTick
	| WorkerEventMapUpdate
	| WorkerEventTimeUpdate
	| WorkerEventStateUpdate
	| WorkerEventBlueFlightGroupsUpdate
	| WorkerEventSerialized;
