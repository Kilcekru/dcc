import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { postEvent } from "../events";
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
	public objectives: Map<string, Entities.Objective> = new Map();

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

		store.factionDefinitions.blue = args.blueFactionDefinition;
		store.factionDefinitions.red = args.redFactionDefinition;

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
			objectives: this.objectives,
		});
		generateStructures({
			coalition: "red",
			objectivePlans: redOps,
			dataStore: store.dataStore,
			objectives: this.objectives,
		});

		generateGroundGroups({
			coalition: "blue",
			objectivePlans: blueOps,
			objectives: this.objectives,
		});
		generateGroundGroups({
			coalition: "red",
			objectivePlans: redOps,
			objectives: this.objectives,
		});

		this.timeUpdate();
		this.mapUpdate();
	}

	public timeUpdate() {
		postEvent({
			name: "timeUpdate",
			time: store.time,
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
