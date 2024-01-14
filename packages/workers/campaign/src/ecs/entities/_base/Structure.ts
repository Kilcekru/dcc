import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../../utils";
import { getEntity, store } from "../../store";
import { Building } from "../Building";
import type { Objective } from "../Objective";
import { MapEntity, MapEntityProps } from "./MapEntity";

export interface StructureProps extends MapEntityProps {
	name: string;
	objectiveId: Types.Campaign.Id;
	position: DcsJs.Position;
	structureType: DcsJs.StructureType;
	buildingIds: Types.Campaign.Id[];
}

export abstract class Structure extends MapEntity<keyof Events.EventMap.Structure> {
	public readonly structureType: DcsJs.StructureType;
	readonly #buildingIds: Types.Campaign.Id[];
	#objectiveId: Types.Campaign.Id;

	get objective() {
		return getEntity<Objective>(this.#objectiveId);
	}

	get buildings() {
		return this.#buildingIds.map((id) => getEntity<Building>(id));
	}

	get alive() {
		for (const building of this.buildings) {
			if (building.alive) {
				return true;
			}
		}

		return false;
	}

	protected constructor(args: StructureProps | Types.Serialization.StructureSerialized) {
		const superArgs: MapEntityProps | Types.Serialization.MapEntitySerialized = Serialization.isSerialized(args)
			? args
			: { ...args, queries: ["mapEntities", "structures", ...(args.queries ?? [])] };
		super(superArgs);
		this.position = args.position;
		this.structureType = args.structureType;
		this.#buildingIds = args.buildingIds;
		this.#objectiveId = args.objectiveId;
	}

	static createBuildings(args: Pick<StructureProps, "structureType" | "name" | "coalition">) {
		const structureTemplate = Utils.Random.item(DcsJs.structures[args.structureType]);

		if (structureTemplate == null) {
			throw new Error("structureTemplate not found");
		}

		return structureTemplate.buildings.map((buildingTemplate, i) => {
			return Building.create({
				name: `${args.name}|${i + 1}`,
				offset: buildingTemplate.offset,
				coalition: args.coalition,
				buildingType: buildingTemplate.type,
			});
		});
	}

	static toMapItems() {
		const blueStructures = store.queries.structures["blue"];
		const redStructures = store.queries.structures["red"];

		const items: Set<Types.Campaign.MapItem> = new Set();

		for (const structure of blueStructures) {
			items.add(structure.toMapJSON());
		}

		for (const structure of redStructures) {
			items.add(structure.toMapJSON());
		}

		return items;
	}

	override toMapJSON(): Types.Campaign.StructureMapItem {
		return {
			...super.toMapJSON(),
			position: this.position,
			type: "structure",
			coalition: this.coalition,
			structureType: this.structureType,
		};
	}

	public override serialize(): Types.Serialization.StructureSerialized {
		return {
			...super.serialize(),
			active: this.alive,
			structureType: this.structureType,
			objectiveId: this.#objectiveId,
			buildingIds: this.#buildingIds,
		};
	}
}
