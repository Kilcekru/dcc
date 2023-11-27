import * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";

import { scenarioList } from "../data";
import * as Domain from "../domain";
import * as Entities from "./entities";

export type Faction = {
	countryName: string;
	airdromes: Set<Entities.Airdrome>;
	packages: Set<Entities.Package>;
	groundGroups: Set<Entities.GroundGroup>;
	structures: Set<Entities.Structure>;
};

export type QueryNames = keyof World["queries"];

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
	public objectives: Map<string, Entities.Objective> = new Map();
	public queries: {
		airdromes: Record<DcsJs.Coalition, Set<Entities.Airdrome>>;
		flightGroups: Record<DcsJs.Coalition, Set<Entities.FlightGroup>>;
		groundGroups: Record<DcsJs.Coalition, Set<Entities.GroundGroup>>;
		aircrafts: Record<DcsJs.Coalition, Set<Entities.Aircraft>>;
		structures: Record<DcsJs.Coalition, Set<Entities.Structure>>;
		unitCamps: Record<DcsJs.Coalition, Set<Entities.Structure>>;
	} = {
		airdromes: {
			blue: new Set(),
			red: new Set(),
			neutrals: new Set(),
		},
		flightGroups: {
			blue: new Set(),
			red: new Set(),
			neutrals: new Set(),
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
	};
	public factionDefinitions: Record<DcsJs.Coalition, DcsJs.Faction | undefined> = {
		blue: undefined,
		neutrals: undefined,
		red: undefined,
	};

	#dataStore: Types.Campaign.DataStore | undefined;

	public get dataStore() {
		return this.#dataStore;
	}

	public async fetchDataStore(map: DcsJs.MapName) {
		this.#dataStore = await rpc.campaign.getDataStore(map);
	}
	public generate(args: {
		blueFactionDefinition: DcsJs.Faction;
		redFactionDefinition: DcsJs.Faction;
		scenarioName: string;
	}) {
		const scenario = scenarioList.find((sc) => sc.name === args.scenarioName);

		if (this.#dataStore == null) {
			throw new Error("createCampaign: dataStore is not fetched");
		}

		if (scenario == null) {
			throw new Error("createCampaign: unknown scenario");
		}

		this.factionDefinitions.blue = args.blueFactionDefinition;
		this.factionDefinitions.red = args.redFactionDefinition;

		// Create airdromes
		Entities.Airdrome.generate({ coalition: "blue", airdromeNames: scenario.blue.airdromeNames });
		Entities.Airdrome.generate({ coalition: "red", airdromeNames: scenario.red.airdromeNames });

		const [blueOps, redOps] = Domain.Campaign.generateObjectivePlans({
			blueAirdromes: [...this.queries.airdromes["blue"].values()],
			redAirdromes: [...this.queries.airdromes["red"].values()],
			blueRange: scenario["blue-start-objective-range"],
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
	}

	public createPackage(args: Entities.PackageProps) {
		const pkg = new Entities.Package({ coalition: args.coalition, task: args.task });
		this.#coalitions[args.coalition].packages.add(pkg);

		return pkg;
	}

	public logicTick() {
		null;
	}

	public frameTick() {
		null;
	}
}

export const world = new World();
