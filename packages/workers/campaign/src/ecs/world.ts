import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { postEvent } from "../events";
import * as Entities from "./entities";
import { SuperSet } from "./SuperSet";
import { frameTickSystems, logicTickSystems } from "./systems";
import { generateObjectivePlans } from "./utils";

export type Faction = {
	countryName: string;
	airdromes: Set<Entities.Airdrome>;
	packages: Set<Entities.Package>;
	groundGroups: Set<Entities.GroundGroup>;
	structures: Set<Entities.Structure>;
};

export type QueryNames = keyof World["queries"];
const taskSubQueries = ["CAP"] as const;

export class World {
	#coalitions: Record<DcsJs.Coalition, Faction> = {
		blue: {
			countryName: "unknown",
			packages: new Set(),
			airdromes: new Set(),
			groundGroups: new Set(),
			structures: new Set(),
		},
		neutrals: {
			countryName: "unknown",
			packages: new Set(),
			airdromes: new Set(),
			groundGroups: new Set(),
			structures: new Set(),
		},
		red: {
			countryName: "unknown",
			packages: new Set(),
			airdromes: new Set(),
			groundGroups: new Set(),
			structures: new Set(),
		},
	};
	public time = 32400000; // 09:00 in milliseconds
	public objectives: Map<string, Entities.Objective> = new Map();

	public queries: {
		airdromes: Record<DcsJs.Coalition, Set<Entities.Airdrome>>;
		packages: Record<DcsJs.Coalition, SuperSet<Entities.Package, (typeof taskSubQueries)[number]>>;
		flightGroups: Record<DcsJs.Coalition, SuperSet<Entities.FlightGroup, (typeof taskSubQueries)[number]>>;
		groundGroups: Record<DcsJs.Coalition, Set<Entities.GroundGroup>>;
		aircrafts: Record<DcsJs.Coalition, Set<Entities.Aircraft>>;
		structures: Record<DcsJs.Coalition, Set<Entities.Structure>>;
		unitCamps: Record<DcsJs.Coalition, Set<Entities.Structure>>;
		mapEntities: Set<Entities.MapEntity>;
	} = {
		airdromes: {
			blue: new Set(),
			red: new Set(),
			neutrals: new Set(),
		},
		packages: {
			blue: new SuperSet(["CAP"]),
			red: new SuperSet(["CAP"]),
			neutrals: new SuperSet(["CAP"]),
		},
		flightGroups: {
			blue: new SuperSet(["CAP"]),
			red: new SuperSet(["CAP"]),
			neutrals: new SuperSet(["CAP"]),
		},
		groundGroups: {
			blue: new Set(),
			red: new Set(),
			neutrals: new Set(),
		},
		aircrafts: {
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
		mapEntities: new Set(),
	};
	public factionDefinitions: Record<DcsJs.Coalition, DcsJs.Faction | undefined> = {
		blue: undefined,
		neutrals: undefined,
		red: undefined,
	};

	#dataStore: Types.Campaign.DataStore | undefined;

	constructor() {
		this.queries.flightGroups.blue.subscribe(() => {
			const items: Set<Types.Campaign.FlightGroupItem> = new Set();

			for (const fg of this.queries.flightGroups.blue) {
				items.add(fg.toJSON());
			}

			postEvent({
				name: "blueFlightGroupsUpdate",
				items,
			});
		});
	}

	public get dataStore() {
		return this.#dataStore;
	}

	public setDataStore(next: Types.Campaign.DataStore) {
		this.#dataStore = next;
	}

	public generate(args: {
		blueFactionDefinition: DcsJs.Faction;
		redFactionDefinition: DcsJs.Faction;
		scenario: Types.Campaign.Scenario;
	}) {
		if (this.#dataStore == null) {
			throw new Error("createCampaign: dataStore is not fetched");
		}

		this.factionDefinitions.blue = args.blueFactionDefinition;
		this.factionDefinitions.red = args.redFactionDefinition;

		// Create airdromes
		Entities.Airdrome.generate({ coalition: "blue", airdromeNames: args.scenario.blue.airdromeNames });
		Entities.Airdrome.generate({ coalition: "red", airdromeNames: args.scenario.red.airdromeNames });

		const [blueOps, redOps] = generateObjectivePlans({
			blueAirdromes: [...this.queries.airdromes["blue"].values()],
			redAirdromes: [...this.queries.airdromes["red"].values()],
			blueRange: args.scenario["blue-start-objective-range"],
			dataStore: this.#dataStore,
		});

		// Create objectives
		Entities.Objective.generate({ blueOps, redOps });

		Entities.Structure.generate({
			coalition: "blue",
			objectivePlans: blueOps,
		});

		Entities.Structure.generate({
			coalition: "red",
			objectivePlans: redOps,
		});

		// eslint-disable-next-line no-console
		console.log("world", this);

		this.timeUpdate();
		this.mapUpdate();
	}

	public timeUpdate() {
		postEvent({
			name: "timeUpdate",
			time: this.time,
		});
	}
	public mapUpdate() {
		const items: Map<string, Types.Campaign.MapItem> = new Map();

		for (const entity of this.queries.mapEntities) {
			items.set(entity.id, entity.toMapJSON());
		}

		postEvent({
			name: "mapUpdate",
			items,
		});
	}

	public createPackage(args: Entities.PackageProps) {
		const pkg = new Entities.Package({ coalition: args.coalition, task: args.task });
		this.#coalitions[args.coalition].packages.add(pkg);

		return pkg;
	}

	public logicTick() {
		logicTickSystems();

		this.timeUpdate();
	}

	public frameTick(deltaMs: number) {
		world.time += deltaMs;

		frameTickSystems();

		this.mapUpdate();
	}
}

export const world = new World();
