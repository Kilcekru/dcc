import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { postEvent } from "../events";
import * as Entities from "./entities";
import { generateObjectivePlans } from "./utils";

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
		mapEntities: Set<Entities.MapEntity>;
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
		mapEntities: new Set(),
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
	}

	public mapUpdate() {
		const items: Set<Types.Campaign.MapItem> = new Set();

		for (const entity of this.queries.mapEntities) {
			items.add(entity.toMapJSON());
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
		null;
	}

	public frameTick() {
		// eslint-disable-next-line no-console
		console.log("frameTick");
	}
}

export const world = new World();

class SuperSet<T, SubSet extends string> extends Set<T> {
	#subSets: Record<SubSet, Set<T>>;

	constructor(subSets: Array<SubSet>) {
		super();

		this.#subSets = {} as Record<SubSet, Set<T>>;

		for (const subSet of subSets) {
			this.#subSets[subSet] = new Set();
		}
	}

	static create<T>(subSets: Array<string>) {
		return new SuperSet<T, (typeof subSets)[number]>(subSets);
	}

	public override add(item: T, subSets?: Array<SubSet>) {
		super.add(item);

		subSets?.forEach((subSet) => {
			this.#subSets[subSet]?.add(item);
		});

		return this;
	}

	public override delete(item: T) {
		const retVal = super.delete(item);

		for (const subSet of Object.values<Set<T>>(this.#subSets)) {
			subSet.delete(item);
		}

		return retVal;
	}

	public override clear() {
		super.clear();

		for (const subSet of Object.values<Set<T>>(this.#subSets)) {
			subSet.clear();
		}
	}

	public override has(item: T, subSet?: SubSet) {
		if (subSet == null) {
			return super.has(item);
		}

		return this.#subSets[subSet].has(item);
	}

	public override values(subSet?: SubSet) {
		if (subSet == null) {
			return super.values();
		}

		return this.#subSets[subSet].values();
	}

	public override keys(subSet?: SubSet) {
		if (subSet == null) {
			return super.keys();
		}

		return this.#subSets[subSet].keys();
	}

	public override entries(subSet?: SubSet) {
		if (subSet == null) {
			return super.entries();
		}

		return this.#subSets[subSet].entries();
	}

	public override forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, subSet?: SubSet) {
		if (subSet == null) {
			return super.forEach(callbackfn);
		}

		return this.#subSets[subSet].forEach(callbackfn);
	}

	public sizeOf(subSet?: SubSet) {
		if (subSet == null) {
			return super.size;
		}

		return this.#subSets[subSet].size;
	}
}

const ss = SuperSet.create<string>(["a", "b", "c"]);

ss.add("a", ["e"]);
