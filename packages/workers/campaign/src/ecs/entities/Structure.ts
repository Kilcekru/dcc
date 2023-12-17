import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { calcInitDeploymentScore } from "../utils";
import { QueryName, world } from "../world";
import { Building } from "./Building";
import { MapEntity, MapEntityProps } from "./MapEntity";
import type { Objective } from "./Objective";

export interface StructureProps extends MapEntityProps {
	name: string;
	objective: Objective;
	position: DcsJs.Position;
	type: DcsJs.StructureType;
}

export class Structure extends MapEntity {
	public name: string;
	public objective: Objective;
	public type: DcsJs.StructureType;
	public state: DcsJs.StructureState = "active";
	public buildings: Array<Building>;

	get alive() {
		for (const building of this.buildings) {
			if (building.alive) {
				return true;
			}
		}

		return false;
	}

	public constructor(args: StructureProps & { queries?: Set<QueryName> }) {
		if (args.queries == null) {
			args.queries = new Set();
		}

		args.queries.add("structures");
		args.queries.add("mapEntities");

		super({
			coalition: args.coalition,
			position: args.position,
			queries: args.queries,
		});
		this.name = args.name;
		this.objective = args.objective;
		this.position = args.position;
		this.type = args.type;

		const structureTemplate = Utils.Random.item(world.dataStore?.structures?.[args.type] ?? []);

		if (structureTemplate == null) {
			throw new Error("structureTemplate not found");
		}

		this.buildings = structureTemplate.buildings.map((buildingTemplate, i) => {
			return new Building({
				name: `${args.name}|${i + 1}`,
				alive: true,
				offset: buildingTemplate.offset,
			});
		});
	}

	static generate(args: { coalition: DcsJs.Coalition; objectivePlans: Array<Types.Campaign.ObjectivePlan> }) {
		const strikeTargets = world.dataStore?.strikeTargets;

		if (strikeTargets == null) {
			throw new Error("strikeTargets not found");
		}

		for (const plan of args.objectivePlans) {
			for (const structurePlan of plan.structures) {
				const strikeTarget = strikeTargets[plan.objectiveName]?.find((st) => st.name === structurePlan.structureName);

				if (strikeTarget == null) {
					// eslint-disable-next-line no-console
					console.warn("strikeTarget not found", {
						objectiveName: plan.objectiveName,
						structureName: structurePlan.structureName,
					});
					continue;
				}

				const structureType = structurePlan.structureType as DcsJs.StructureType;

				const objective = world.objectives.get(plan.objectiveName);

				if (objective == null) {
					// eslint-disable-next-line no-console
					console.warn("objective not found", { objectiveName: plan.objectiveName });
					continue;
				}

				if (structureType === "Barrack" || structureType === "Depot") {
					new UnitCamp({
						name: structurePlan.structureName,
						objective,
						position: strikeTarget.position,
						type: structureType,
						coalition: args.coalition,
					});
				} else {
					new Structure({
						name: structurePlan.structureName,
						objective,
						position: strikeTarget.position,
						type: structureType,
						coalition: args.coalition,
					});
				}
			}
		}
	}

	static toMapItems() {
		const blueStructures = world.queries.structures["blue"];
		const redStructures = world.queries.structures["red"];

		const items: Set<Types.Campaign.MapItem> = new Set();

		for (const structure of blueStructures) {
			items.add(structure.toMapJSON());
		}

		for (const structure of redStructures) {
			items.add(structure.toMapJSON());
		}

		return items;
	}

	override toMapJSON(): Types.Campaign.MapItem {
		return {
			name: this.name,
			position: this.position,
			type: "structure",
			coalition: this.coalition,
			structureType: this.type,
		};
	}

	override toJSON(): Types.Campaign.StructureItem {
		return {
			...super.toJSON(),
			name: this.name,
			objective: this.objective.name,
			type: this.type,
			buildings: this.buildings.map((building) => building.toJSON()),
			state: this.state,
		};
	}
}

export interface UnitCampProps extends StructureProps {
	type: DcsJs.StructureTypeUnitCamp;
}

export class UnitCamp extends Structure {
	public deploymentScore: number;
	public override type: DcsJs.StructureTypeUnitCamp;

	get range() {
		return this.type === "Barrack"
			? Utils.Config.structureRange.frontline.barrack
			: Utils.Config.structureRange.frontline.depot;
	}

	get deploymentCost() {
		const baseline =
			this.type === "Barrack"
				? Utils.Config.deploymentScore.frontline.barrack
				: Utils.Config.deploymentScore.frontline.depot;

		return baseline * Utils.Config.deploymentScore.coalitionMultiplier[this.coalition];
	}

	get hasPower() {
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.type === "Power Plant" && structure.alive) {
				if (Utils.Location.inRange(this.position, structure.position, Utils.Config.structureRange.power)) {
					return true;
				}
			}
		}

		return false;
	}

	get hasAmmo() {
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.type === "Ammo Depot" && structure.alive) {
				if (Utils.Location.inRange(this.position, structure.position, Utils.Config.structureRange.ammo)) {
					return true;
				}
			}
		}

		return false;
	}

	get hasFuel() {
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.type === "Fuel Storage" && structure.alive) {
				if (Utils.Location.inRange(this.position, structure.position, Utils.Config.structureRange.fuel)) {
					return true;
				}
			}
		}

		return false;
	}

	constructor(args: UnitCampProps) {
		super({ ...args, queries: new Set(["unitCamps"]) });
		this.type = args.type;
		this.deploymentScore = calcInitDeploymentScore(args.coalition, args.type);

		world.queries.unitCamps[args.coalition].add(this);
	}
}
