import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { Building } from "../../objects";
import { world } from "../../world";
import type { Objective } from "../Objective";
import { MapEntity, MapEntityProps } from "./MapEntity";

export interface StructureProps extends MapEntityProps {
	name: string;
	objective: Objective;
	position: DcsJs.Position;
	structureType: DcsJs.StructureType;
}

export abstract class Structure extends MapEntity<keyof Events.EventMap.Structure> {
	public readonly name: string;
	public readonly structureType: DcsJs.StructureType;
	public readonly buildings: Array<Building>;
	#objectiveId: Types.Campaign.Id;
	#state: DcsJs.StructureState = "active";

	get objective() {
		return world.getEntity<Objective>(this.#objectiveId);
	}

	get alive() {
		for (const building of this.buildings) {
			if (building.alive) {
				return true;
			}
		}

		return false;
	}

	protected constructor(args: StructureProps | Serialization.StructureSerialized) {
		const superArgs: MapEntityProps | Serialization.MapEntitySerialized = Serialization.isSerialized(args)
			? args
			: { ...args, queries: ["mapEntities", ...(args.queries ?? [])] };
		super(superArgs);
		this.name = args.name;
		this.position = args.position;
		this.structureType = args.structureType;
		if (Serialization.isSerialized(args)) {
			this.#objectiveId = args.objectiveId;
			this.buildings = []; // TODO: correctly serialize and deserialize buildings
		} else {
			this.#objectiveId = args.objective.id;

			const structureTemplate = Utils.Random.item(world.dataStore?.structures?.[args.structureType] ?? []);

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
			structureType: this.structureType,
		};
	}

	override toJSON(): Types.Campaign.StructureItem {
		return {
			...super.toJSON(),
			name: this.name,
			objective: this.objective.name,
			structureType: this.structureType,
			buildings: this.buildings.map((building) => building.toJSON()),
			state: this.#state,
		};
	}

	public override serialize(): Serialization.StructureSerialized {
		return {
			...super.serialize(),
			name: this.name,
			structureType: this.structureType,
			objectiveId: this.#objectiveId,
			// TODO: correctly serialize and deserialize buildings
		};
	}
}
