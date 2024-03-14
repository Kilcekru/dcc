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
		campaignParams: Types.Campaign.CampaignParams;
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
		store.campaignParams = args.campaignParams;
		store.date = args.scenario.date;

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
			blueObjectiveNames: args.scenario.blue.objectives,
			redObjectiveNames: args.scenario.red.objectives,
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

		const blueAirdromes = new Set<string>();
		for (const airdrome of store.queries.airdromes.blue) {
			blueAirdromes.add(airdrome.name);
		}
		const redAirdromes = new Set<string>();
		for (const airdrome of store.queries.airdromes.red) {
			redAirdromes.add(airdrome.name);
		}

		postEvent({
			name: "stateUpdate",
			state: {
				date: store.date,
				time: store.time,
				timeMultiplier: store.timeMultiplier,
				id: store.id,
				name: store.name,
				flightGroups,
				entities: new Map(state.entities.map((entity) => [entity.id, entity])),
				factionDefinitions: store.factionDefinitions,
				airdromes: {
					blue: blueAirdromes,
					red: redAirdromes,
					neutrals: new Set<string>(),
				},
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
		let worldDelta = tickDelta * multiplier;
		let earliestStartTime = Infinity;

		for (const fg of store.queries.flightGroups.blue) {
			if (!fg.alive) {
				continue;
			}

			if (fg.hasClients) {
				if (fg.startTime < earliestStartTime) {
					earliestStartTime = fg.startTime;
				}
			}
		}

		const next = store.time + worldDelta;

		// If we next tick will be after the earliest start time, we stop at the start time
		if (next > earliestStartTime) {
			if (earliestStartTime < store.time) {
				worldDelta = 0;
			} else {
				worldDelta = earliestStartTime - store.time;
				store.time = earliestStartTime;
			}
		} else {
			store.time += worldDelta;
		}

		store.timeMultiplier = multiplier;

		frameTickSystems(worldDelta);

		this.mapUpdate();
		this.timeUpdate();
	}

	public submitMissionState(state: Types.Campaign.MissionState) {
		for (const name of state.destroyedGroundUnits) {
			for (const unit of store.queries.groundUnits.blue.values()) {
				if (unit.name === name) {
					unit.destroy();
				}
			}
			for (const unit of store.queries.groundUnits.red.values()) {
				if (unit.name === name) {
					unit.destroy();
				}
			}

			for (const building of store.queries.buildings.blue.values()) {
				if (building.name === name) {
					building.destroy();
				}
			}

			for (const building of store.queries.buildings.red.values()) {
				if (building.name === name) {
					building.destroy();
				}
			}
		}

		for (const name of state.crashedAircrafts) {
			for (const aircraft of store.queries.aircrafts.blue) {
				if (aircraft.name === name) {
					aircraft.destroy();
				}
			}
			for (const aircraft of store.queries.aircrafts.blue) {
				if (aircraft.name === name) {
					aircraft.destroy();
				}
			}
		}

		if (state.groupPositions.blue != null) {
			for (const entry of state.groupPositions.blue) {
				for (const group of store.queries.flightGroups.blue) {
					if (group.name === entry.name) {
						group.position = { x: entry.x, y: entry.y };
					}
				}
			}
		}
	}
}

export const world = new World();

self.world = world;
