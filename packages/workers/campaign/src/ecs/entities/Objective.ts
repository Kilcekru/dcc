import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Position } from "../components";
import { world } from "../world";
import { Entity } from "./Entity";
import type { GroundGroup } from "./GroundGroup";
import { Structure } from "./Structure";

export class Objective extends Entity implements Position {
	public name: string;
	public position: DcsJs.Position;
	public incomingGroundGroup: GroundGroup | undefined;

	public constructor(args: { name: string; coalition: DcsJs.Coalition; position: DcsJs.Position }) {
		super({ ...args, queries: new Set(["objectives"]) });
		this.name = args.name;
		this.coalition = args.coalition;
		this.position = args.position;

		world.objectives.set(this.name, this);
	}

	public static generate(args: {
		blueOps: Array<Types.Campaign.DynamicObjectivePlan>;
		redOps: Array<Types.Campaign.DynamicObjectivePlan>;
	}) {
		const objectives = world.dataStore?.objectives;
		if (objectives == null) {
			throw new Error("createObjectives: dataStore is not fetched");
		}

		for (const objective of objectives) {
			const isBlue = args.blueOps.some((obj) => obj.objectiveName === objective.name);
			const isRed = args.redOps.some((obj) => obj.objectiveName === objective.name);

			if (!isBlue && !isRed) {
				continue;
			}

			new Objective({
				coalition: isBlue ? "blue" : "red",
				name: objective.name,
				position: objective.position,
			});
		}
	}

	conquer(groundGroup: GroundGroup) {
		const structures: Array<Structure> = [];
		// Remove all structures from the objective (should be only one)
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.objective === this) {
				structures.push(structure);
				structure.deconstructor();
			}
		}

		// Change the coalition of the objective
		this.removeFromQuery("objectives");
		this.coalition = groundGroup.coalition;
		this.addToQuery("objectives");
		this.incomingGroundGroup = undefined;

		// Create new structures
		for (const structure of structures) {
			new Structure({
				coalition: groundGroup.coalition,
				name: structure.name,
				objective: this,
				position: structure.position,
				type: structure.type,
			});
		}

		groundGroup.moveOntoTarget();
	}

	override toJSON(): Types.Campaign.ObjectiveItem {
		return {
			...super.toJSON(),
			name: this.name,
			coalition: this.coalition,
			position: this.position,
			incomingGroundGroup: this.incomingGroundGroup?.id,
		};
	}
}
