import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { world } from "../../world";
import { Building } from "../Building";
import type { Objective } from "../Objective";
import { MapEntity, MapEntityProps } from "./MapEntity";

export interface StructureProps extends MapEntityProps {
	name: string;
	objective: Objective;
	position: DcsJs.Position;
	structureType: DcsJs.StructureType;
	buildingIds: Types.Campaign.Id[];
}

export abstract class Structure extends MapEntity<keyof Events.EventMap.Structure> {
	public readonly name: string;
	public readonly structureType: DcsJs.StructureType;
	readonly #buildingIds: Types.Campaign.Id[];
	#objectiveId: Types.Campaign.Id;
	#state: DcsJs.StructureState = "active";

	get objective() {
		return world.getEntity<Objective>(this.#objectiveId);
	}

	get buildings() {
		return this.#buildingIds.map((id) => world.getEntity<Building>(id));
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
			: { ...args, queries: ["mapEntities", "structures", ...(args.queries ?? [])] };
		super(superArgs);
		this.name = args.name;
		this.position = args.position;
		this.structureType = args.structureType;
		this.#buildingIds = args.buildingIds;
		if (Serialization.isSerialized(args)) {
			this.#objectiveId = args.objectiveId;
			this.#buildingIds = []; // TODO: correctly serialize and deserialize buildings
		} else {
			this.#objectiveId = args.objective.id;
		}
	}

	static createBuildings(args: Pick<StructureProps, "structureType" | "name" | "coalition">) {
		const structureTemplate = Utils.Random.item(world.dataStore?.structures?.[args.structureType] ?? []);

		if (structureTemplate == null) {
			throw new Error("structureTemplate not found");
		}

		return structureTemplate.buildings.map((buildingTemplate, i) => {
			return Building.create({
				name: `${args.name}|${i + 1}`,
				offset: buildingTemplate.offset,
				coalition: args.coalition,
			});
		});
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

	public override serialize(): Serialization.StructureSerialized {
		return {
			...super.serialize(),
			name: this.name,
			structureType: this.structureType,
			objectiveId: this.#objectiveId,
			buildingIds: this.#buildingIds,
		};
	}
}
