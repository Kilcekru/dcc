import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { postEvent } from "../events";
import { Serialization } from "../utils";
import * as Entities from "./entities";
import { store } from "./store";
import { frameTickSystems, logicTickSystems } from "./systems";
import { generateAirdromes, generateGroundGroups, generateObjectives, generateStructures } from "./world/generate";
import { generateObjectivePlans } from "./world/objectivePlan";

export type Faction = {
	countryName: string;
	airdromes: Set<Entities.Airdrome>;
	packages: Set<Entities.Package>;
	groundGroups: Set<Entities.GroundGroup>;
	structures: Set<Entities.Structure>;
};

export class World {
	public setDataStore(next: Types.Campaign.DataStore) {
		store.dataStore = next;
	}

	public generate(args: {
		blueFactionDefinition: DcsJs.Faction;
		redFactionDefinition: DcsJs.Faction;
		scenario: Types.Campaign.Scenario;
	}) {
		if (store.dataStore == null) {
			throw new Error("createCampaign: dataStore is not fetched");
		}

		store.id = crypto.randomUUID();
		store.version = 1;
		store.time = 32400000; // 09:00 in milliseconds
		store.map = args.scenario.map as DcsJs.MapName; // TODO: fix scenario map type
		store.name = args.scenario.name;
		store.factionDefinitions = {
			blue: args.blueFactionDefinition,
			neutrals: undefined,
			red: args.redFactionDefinition,
		};

		// Create airdromes
		generateAirdromes({
			coalition: "blue",
			airdromeNames: args.scenario.blue.airdromeNames,
			dataStore: store.dataStore,
		});
		generateAirdromes({ coalition: "red", airdromeNames: args.scenario.red.airdromeNames, dataStore: store.dataStore });

		const [blueOps, redOps] = generateObjectivePlans({
			blueAirdromes: [...store.queries.airdromes["blue"].values()],
			redAirdromes: [...store.queries.airdromes["red"].values()],
			blueRange: args.scenario["blue-start-objective-range"],
			dataStore: store.dataStore,
		});

		// Create objectives
		generateObjectives({ blueOps, redOps, dataStore: store.dataStore });

		// Create structures
		generateStructures({
			coalition: "blue",
			objectivePlans: blueOps,
			dataStore: store.dataStore,
			objectives: store.queries.objectives,
		});
		generateStructures({
			coalition: "red",
			objectivePlans: redOps,
			dataStore: store.dataStore,
			objectives: store.queries.objectives,
		});

		generateGroundGroups({
			coalition: "blue",
			objectivePlans: blueOps,
			objectives: store.queries.objectives,
		});
		generateGroundGroups({
			coalition: "red",
			objectivePlans: redOps,
			objectives: store.queries.objectives,
		});

		this.stateUpdate();
		this.mapUpdate();
	}

	public timeUpdate() {
		postEvent({
			name: "timeUpdate",
			time: store.time,
		});
	}
	public stateUpdate() {
		const flightGroups: Serialization.FlightGroupSerialized[] = [];

		for (const fg of store.queries.flightGroups.blue) {
			flightGroups.push(fg.serialize());
		}

		const state = Serialization.serialize();

		postEvent({
			name: "stateUpdate",
			state: {
				time: store.time,
				timeMultiplier: store.timeMultiplier,
				id: store.id,
				name: store.name,
				flightGroups,
				entities: new Map(state.entities.map((entity) => [entity.id, entity])),
			},
		});
	}
	public mapUpdate() {
		const items: Map<string, Types.Campaign.MapItem> = new Map();

		for (const entity of store.queries.mapEntities) {
			items.set(entity.id, entity.toMapJSON());
		}

		postEvent({
			name: "mapUpdate",
			items,
			map: store.map,
		});
	}
	public flightGroupsUpdate() {
		const items: Set<Types.Campaign.FlightGroupItem> = new Set();

		for (const fg of store.queries.flightGroups.blue) {
			items.add(fg.toJSON());
		}

		postEvent({
			name: "blueFlightGroupsUpdate",
			items,
		});
	}

	public logicTick() {
		logicTickSystems();

		this.stateUpdate();
	}

	public frameTick(tickDelta: number, multiplier: number) {
		const worldDelta = tickDelta * multiplier;
		store.time += worldDelta;
		store.timeMultiplier = multiplier;

		frameTickSystems(worldDelta);

		this.mapUpdate();
		this.timeUpdate();
	}
}

export const world = new World();

self.world = world;
