import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import type * as Entities from "../entities";
import { SuperSet } from "../SuperSet";

const taskSubQueries = ["CAP", "CAS", "Escort", "Air Assault", "Pinpoint Strike"];
const aircraftSubQueries = ["idle", "in use"];
const groundGroupSubQueries = ["en route", "on target", "embarked"];

function initializeStore(): Store {
	return {
		entities: new Map(),
		queries: {
			airdromes: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			packages: {
				blue: new SuperSet(taskSubQueries),
				red: new SuperSet(taskSubQueries),
				neutrals: new SuperSet(taskSubQueries),
			},
			flightGroups: {
				blue: new SuperSet(taskSubQueries),
				red: new SuperSet(taskSubQueries),
				neutrals: new SuperSet(taskSubQueries),
			},
			groundGroups: {
				blue: new SuperSet(groundGroupSubQueries),
				red: new SuperSet(groundGroupSubQueries),
				neutrals: new SuperSet(groundGroupSubQueries),
			},
			aircrafts: {
				blue: new SuperSet(aircraftSubQueries),
				red: new SuperSet(aircraftSubQueries),
				neutrals: new SuperSet(aircraftSubQueries),
			},
			groundUnits: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			structures: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			unitCamps: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			SAMs: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			mapEntities: new Set(),
			objectives: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			buildings: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
		},
		factionDefinitions: {
			blue: undefined,
			neutrals: undefined,
			red: undefined,
		},
		dataStore: undefined,
		time: 32400000, // 09:00 in milliseconds
		timeMultiplier: 1,
	};
}

interface Queries {
	airdromes: Record<DcsJs.Coalition, Set<Entities.Airdrome>>;
	packages: Record<DcsJs.Coalition, SuperSet<Entities.Package, (typeof taskSubQueries)[number]>>;
	flightGroups: Record<DcsJs.Coalition, SuperSet<Entities.FlightGroup, (typeof taskSubQueries)[number]>>;
	groundGroups: Record<DcsJs.Coalition, SuperSet<Entities.GroundGroup, (typeof groundGroupSubQueries)[number]>>;
	aircrafts: Record<DcsJs.Coalition, SuperSet<Entities.Aircraft, (typeof aircraftSubQueries)[number]>>;
	groundUnits: Record<DcsJs.Coalition, Set<Entities.GroundUnit>>;
	structures: Record<DcsJs.Coalition, Set<Entities.Structure>>;
	unitCamps: Record<DcsJs.Coalition, Set<Entities.UnitCamp>>;
	SAMs: Record<DcsJs.Coalition, Set<Entities.SAM>>;
	mapEntities: Set<Entities.MapEntity>;
	objectives: Record<DcsJs.Coalition, Set<Entities.Objective>>;
	buildings: Record<DcsJs.Coalition, Set<Entities.Building>>;
}

export type QueryName = keyof Queries;
export type QueryKey = QueryName | `${QueryName}-${string}`;

interface Store {
	entities: Map<Types.Campaign.Id, Entities.Entity>;
	queries: Queries;
	factionDefinitions: Record<DcsJs.Coalition, DcsJs.Faction | undefined>;
	dataStore: Types.Campaign.DataStore | undefined;
	time: number;
	timeMultiplier: number;
}

export let store: Store = initializeStore();

export function reset() {
	store = initializeStore();
}

self.store = store;
self.resetStore = reset;
