import * as Types from "@kilcekru/dcc-shared-types";

import { Serialization } from "../../utils";
import { Structure, StructureProps } from "./_base/Structure";
export type GenericStructureProps = Omit<StructureProps, "entityType">;

export class GenericStructure extends Structure {
	private constructor(args: GenericStructureProps | Types.Serialization.GenericStructureSerialized) {
		const superArgs = Serialization.isSerialized(args) ? args : { ...args, entityType: "GenericStructure" as const };
		super(superArgs);
	}

	static create(args: Omit<GenericStructureProps, "buildingIds">) {
		const buildings = Structure.createBuildings(args);

		return new GenericStructure({
			...args,
			buildingIds: buildings.map((building) => building.id),
		});
	}

	static deserialize(args: Types.Serialization.GenericStructureSerialized) {
		return new GenericStructure(args);
	}

	public override serialize(): Types.Serialization.GenericStructureSerialized {
		return {
			...super.serialize(),
			entityType: "GenericStructure",
		};
	}
}
