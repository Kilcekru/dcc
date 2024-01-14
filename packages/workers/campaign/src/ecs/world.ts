import * as Types from "@kilcekru/dcc-shared-types";

import { postEvent } from "../events";
import { Serialization } from "../utils";
import * as Entities from "./entities";
import { store } from "./store";
import { frameTickSystems, logicTickSystems } from "./systems";
import {
	generateAirdromes,
	generateGroundGroups,
	generateObjectives,
	generateSAMs,
	generateStructures,
} from "./world/generate";
import { generateObjectivePlans } from "./world/objectivePlan";

export type Faction = {
	countryName: string;
	airdromes: Set<Entities.Airdrome>;
	packages: Set<Entities.Package>;
	groundGroups: Set<Entities.GroundGroup>;
	structures: Set<Entities.Structure>;
};

export class World {
	public generate(args: {
		blueFactionDefinition: Types.Campaign.Faction;
		redFactionDefinition: Types.Campaign.Faction;
		scenario: Types.Campaign.Scenario;
	}) {
		store.id = crypto.randomUUID();
		store.version = 1;
		store.time = 32400000; // 09:00 in milliseconds
		store.theatre = args.scenario.theatre;
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
			theatre: args.scenario.theatre,
		});
		generateAirdromes({
			coalition: "red",
			airdromeNames: args.scenario.red.airdromeNames,
			theatre: args.scenario.theatre,
		});

		const [blueOps, redOps] = generateObjectivePlans({
			blueAirdromes: [...store.queries.airdromes["blue"].values()],
			redAirdromes: [...store.queries.airdromes["red"].values()],
			blueRange: args.scenario["blue-start-objective-range"],
			theatre: args.scenario.theatre,
		});

		// Create objectives
		generateObjectives({ blueOps, redOps, theatre: args.scenario.theatre });

		// Create structures
		generateStructures({
			coalition: "blue",
			objectivePlans: blueOps,
			objectives: store.queries.objectives,
			theatre: args.scenario.theatre,
		});
		generateStructures({
			coalition: "red",
			objectivePlans: redOps,
			objectives: store.queries.objectives,
			theatre: args.scenario.theatre,
		});

		// Create SAMs
		generateSAMs({
			coalition: "blue",
			objectivePlans: blueOps,
			objectives: store.queries.objectives,
			theatre: args.scenario.theatre,
		});

		generateSAMs({
			coalition: "red",
			objectivePlans: redOps,
			objectives: store.queries.objectives,
			theatre: args.scenario.theatre,
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
		const flightGroups: Types.Serialization.FlightGroupSerialized[] = [];
		let hasClients = false;
		let earliestStartTime = Infinity;

		for (const fg of store.queries.flightGroups.blue) {
			if (!fg.alive) {
				continue;
			}

			if (fg.hasClients) {
				hasClients = true;

				if (fg.startTime < earliestStartTime) {
					earliestStartTime = fg.startTime;
				}
			}
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
				factionDefinitions: store.factionDefinitions,
				hasClients: hasClients,
				campaignParams: state.campaignParams,
				startTimeReached: store.time >= earliestStartTime,
				theatre: store.theatre,
				weather: store.weather,
			},
		});
	}
	public mapUpdate() {
		const items: Map<string, Types.Campaign.MapItem> = new Map();

		for (const entity of store.queries.mapEntities) {
			if (!entity.hidden) {
				items.set(entity.id, entity.toMapJSON() as Types.Campaign.MapItem);
			}
		}

		postEvent({
			name: "mapUpdate",
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
