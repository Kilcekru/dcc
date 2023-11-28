import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Coalition, Position } from "../components";
import { QueryNames, world } from "../world";
import { Building } from "./Building";
import { MapEntity } from "./MapEntity";
import { Objective } from "./Objective";

export interface StructureProps extends Coalition, Position {
	name: string;
	objective: Objective;
	position: DcsJs.Position;
	type: DcsJs.StructureType;
}

export class Structure extends MapEntity implements Coalition, Position {
	public name: string;
	public objective: Objective;
	public type: DcsJs.StructureType;
	public state: DcsJs.StructureState = "active";
	public buildings: Array<Building>;

	public constructor(args: StructureProps & { queries?: Array<QueryNames> }) {
		super({
			coalition: args.coalition,
			position: args.position,
			queries: (args.queries ?? []).concat(["structures", "mapEntities"]),
		});
		this.name = args.name;
		this.objective = args.objective;
		this.position = args.position;
		this.type = args.type;
		this.coalition = args.coalition;

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
}

function calcInitDeploymentScore(coalition: DcsJs.Coalition, structureType: DcsJs.StructureType) {
	const margin = Utils.Random.number(0.8, 1.2);

	switch (structureType) {
		case "Barrack": {
			return (
				(Utils.Config.deploymentScore.frontline.barrack /
					Utils.Config.deploymentScore.frontline.initialFactor[coalition]) *
				margin
			);
		}
		case "Depot": {
			return (
				(Utils.Config.deploymentScore.frontline.depot /
					Utils.Config.deploymentScore.frontline.initialFactor[coalition]) *
				margin
			);
		}
	}

	return 0;
}

export interface UnitCampProps extends StructureProps {
	type: DcsJs.StructureTypeUnitCamp;
}

export class UnitCamp extends Structure {
	public deploymentScore: number;
	public override type: DcsJs.StructureTypeUnitCamp;

	constructor(args: UnitCampProps) {
		super({ ...args, queries: ["unitCamps"] });
		this.type = args.type;
		this.deploymentScore = calcInitDeploymentScore(args.coalition, args.type);

		world.queries.unitCamps[args.coalition].add(this);
	}
}
