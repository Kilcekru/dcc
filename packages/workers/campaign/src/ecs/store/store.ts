import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import type * as Entities from "../entities";
import { SuperSet } from "../SuperSet";

const flightGroupQueries = [
	"CAP",
	"CAS",
	"Escort",
	"Air Assault",
	"Pinpoint Strike",
	"DEAD",
	"start up",
	"in air",
	"landed",
	"destroyed",
];
const aircraftSubQueries = ["idle", "in use"];
const groundGroupSubQueries = ["en route", "on target", "embarked"];
const samSubQueries = ["active", "inactive"];

function initializeStore(): Store {
	return {
		id: "",
		name: "New Campaign",
		entities: new Map(),
		queries: {
			airdromes: {
				blue: new Set(),
				red: new Set(),
				neutrals: new Set(),
			},
			packages: {
				blue: new SuperSet(flightGroupQueries),
				red: new SuperSet(flightGroupQueries),
				neutrals: new SuperSet(flightGroupQueries),
			},
			flightGroups: {
				blue: new SuperSet(flightGroupQueries),
				red: new SuperSet(flightGroupQueries),
				neutrals: new SuperSet(flightGroupQueries),
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
				blue: new SuperSet(samSubQueries),
				red: new SuperSet(samSubQueries),
				neutrals: new SuperSet(samSubQueries),
			},
			mapEntities: new Set(),
			objectives: new Set(),
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
		time: 32400000, // 09:00 in milliseconds
		timeMultiplier: 1,
		theatre: "Caucasus",
		weather: {
			cloudCover: 0,
			cloudCoverData: [],
			offset: 0,
			temperature: 0,
			wind: {
				direction: 0,
				speed: 0,
			},
		},
		campaignParams: {
			aiSkill: "Average",
			badWeather: false,
			hardcore: false,
			nightMissions: false,
			training: false,
		},
		version: 1,
	};
}

interface Queries {
	airdromes: Record<DcsJs.Coalition, Set<Entities.Airdrome>>;
	packages: Record<DcsJs.Coalition, SuperSet<Entities.Package, (typeof flightGroupQueries)[number]>>;
	flightGroups: Record<DcsJs.Coalition, SuperSet<Entities.FlightGroup, (typeof flightGroupQueries)[number]>>;
	groundGroups: Record<DcsJs.Coalition, SuperSet<Entities.GroundGroup, (typeof groundGroupSubQueries)[number]>>;
	aircrafts: Record<DcsJs.Coalition, SuperSet<Entities.Aircraft, (typeof aircraftSubQueries)[number]>>;
	groundUnits: Record<DcsJs.Coalition, Set<Entities.GroundUnit>>;
	structures: Record<DcsJs.Coalition, Set<Entities.Structure>>;
	unitCamps: Record<DcsJs.Coalition, Set<Entities.UnitCamp>>;
	SAMs: Record<DcsJs.Coalition, SuperSet<Entities.SAM, (typeof samSubQueries)[number]>>;
	mapEntities: Set<Entities.MapEntity>;
	buildings: Record<DcsJs.Coalition, Set<Entities.Building>>;
	objectives: Set<Entities.Objective>;
}

export type QueryName = keyof Queries;
export type QueryKey = QueryName | `${QueryName}-${string}`;

interface Store {
	id: string;
	name: string;
	entities: Map<Types.Campaign.Id, Entities.Entity>;
	queries: Queries;
	factionDefinitions: Record<DcsJs.Coalition, Types.Campaign.Faction | undefined>;
	time: number;
	timeMultiplier: number;
	theatre: DcsJs.Theatre;
	weather: DcsJs.Weather;
	campaignParams: Types.Campaign.CampaignParams;
	version: number;
}

export let store: Store = initializeStore();

export function reset() {
	setStore(initializeStore());
}

export function setStore(newStore: Store) {
	store = newStore;
}

self.store = store;
self.resetStore = reset;
