import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../utils";
import { getEntity, QueryKey, store } from "../store";
import { Entity, EntityProps } from "./_base";
import { Structure } from "./_base/Structure";
import { GenericStructure } from "./GenericStructure";
import { GroundGroup } from "./GroundGroup";

interface ObjectiveProps extends Omit<EntityProps, "entityType" | "queries"> {
	name: string;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

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

	private constructor(args: ObjectiveProps | Serialization.ObjectiveSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, queries: ["objectives"] as QueryKey[], entityType: "Objective" as const };
		super(superArgs);
		this.name = args.name;
		this.coalition = args.coalition;
		this.position = args.position;

		if (Serialization.isSerialized(args)) {
			this.#incomingGroundGroupId = args.incomingGroundGroupId;
		}
	}

	static create(args: ObjectiveProps) {
		return new Objective(args);
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

	static deserialize(args: Serialization.ObjectiveSerialized) {
		return new Objective(args);
	}

	public override serialize(): Serialization.ObjectiveSerialized {
		return {
			...super.serialize(),
			entityType: "Objective",
			position: this.position,
			name: this.name,
			incomingGroundGroupId: this.#incomingGroundGroupId,
		};
	}
}
