import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events } from "../../utils";
import { getEntity, store } from "../store";
import { world } from "../world";
import { Entity } from "./_base/Entity";
import { Structure } from "./_base/Structure";
import { GenericStructure } from "./GenericStructure";
import { GroundGroup } from "./GroundGroup";

export class Objective extends Entity<keyof Events.EventMap.Objective> {
	public readonly name: string;
	public readonly position: DcsJs.Position;
	public override coalition: DcsJs.Coalition;
	#incomingGroundGroupId: Types.Campaign.Id | undefined;

	get incomingGroundGroup(): GroundGroup | undefined {
		if (this.#incomingGroundGroupId == undefined) {
			return undefined;
		}

		return getEntity<GroundGroup>(this.#incomingGroundGroupId);
	}

	/**
	 * Set the incoming ground group
	 */
	set incomingGroundGroup(groundGroup: GroundGroup) {
		if (this.#incomingGroundGroupId != undefined) {
			throw new Error("incoming ground group is already set");
		}

		this.#incomingGroundGroupId = groundGroup.id;
	}

	public constructor(args: { name: string; coalition: DcsJs.Coalition; position: DcsJs.Position }) {
		super({ ...args, entityType: "Objective", queries: ["objectives"] });
		this.name = args.name;
		this.coalition = args.coalition;
		this.position = args.position;

		world.objectives.set(this.name, this);
	}

	public static generate(args: {
		blueOps: Array<Types.Campaign.DynamicObjectivePlan>;
		redOps: Array<Types.Campaign.DynamicObjectivePlan>;
	}) {
		const objectives = store.dataStore?.objectives;
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
		for (const structure of store.queries.structures[this.coalition]) {
			if (structure.objective === this) {
				structures.push(structure);
				structure.destructor();
			}
		}

		// Change the coalition of the objective
		this.removeFromQuery("objectives");
		this.coalition = groundGroup.coalition;
		this.addToQuery("objectives");
		this.#incomingGroundGroupId = undefined;

		// Create new structures
		for (const structure of structures) {
			GenericStructure.create({
				coalition: groundGroup.coalition,
				name: structure.name,
				objective: this,
				position: structure.position,
				structureType: structure.structureType,
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
			incomingGroundGroup: this.#incomingGroundGroupId,
		};
	}
}
