import * as DcsJs from "@foxdelta2/dcsjs";

import { ObjectivePlan } from "../../data";
import { Config } from "../../data";
import * as Domain from "../../domain";
import { Coalition, Position } from "../components";
import { world } from "../world";
import { Building } from "./Building";
import { Objective } from "./Objective";

export interface StructureProps extends Coalition, Position {
	name: string;
	objective: Objective;
	position: DcsJs.Position;
	type: DcsJs.StructureType;
}

export class Structure implements Coalition, Position {
	public name: string;
	public objective: Objective;
	public coalition: DcsJs.Coalition;
	public position: DcsJs.Position;
	public type: DcsJs.StructureType;
	public state: DcsJs.StructureState = "active";
	public buildings: Array<Building>;

	public constructor(args: StructureProps) {
		this.name = args.name;
		this.objective = args.objective;
		this.position = args.position;
		this.type = args.type;
		this.coalition = args.coalition;

		const structureTemplate = Domain.Random.item(world.dataStore?.structures?.[args.type] ?? []);

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

		world.queries.structures[args.coalition].add(this);
	}

	static generate(args: { coalition: DcsJs.Coalition; objectivePlans: Array<ObjectivePlan> }) {
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
}

function calcInitDeploymentScore(coalition: DcsJs.Coalition, structureType: DcsJs.StructureType) {
	const margin = Domain.Random.number(0.8, 1.2);

	switch (structureType) {
		case "Barrack": {
			return (
				(Config.deploymentScore.frontline.barrack / Config.deploymentScore.frontline.initialFactor[coalition]) * margin
			);
		}
		case "Depot": {
			return (
				(Config.deploymentScore.frontline.depot / Config.deploymentScore.frontline.initialFactor[coalition]) * margin
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
		super(args);
		this.type = args.type;
		this.deploymentScore = calcInitDeploymentScore(args.coalition, args.type);

		world.queries.unitCamps[args.coalition].add(this);
	}
}
