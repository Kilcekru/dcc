import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Serialization } from "../../utils";
import { QueryKey } from "../store";
import { Unit, UnitProps } from "./_base";

export interface BuildingProps extends Omit<UnitProps, "entityType"> {
	name: string;
	offset: DcsJs.Position;
	staticType: DcsJs.StaticType;
}
export class Building extends Unit {
	public readonly name: string;
	public readonly staticType: DcsJs.StaticType;
	public readonly offset: DcsJs.Position;
	#repairScore: number | undefined;

	get repairScore() {
		return this.#repairScore;
	}

	get repairCost() {
		return Utils.Config.deploymentScore.repair;
	}

	private constructor(args: BuildingProps | Types.Serialization.BuildingSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, queries: ["buildings"] as QueryKey[], entityType: "Building" as const };
		super(superArgs);
		this.name = args.name;
		this.offset = args.offset;
		this.staticType = args.staticType;
	}

	static create(args: BuildingProps) {
		return new Building(args);
	}

	static deserialize(args: Types.Serialization.BuildingSerialized) {
		return new Building(args);
	}

	public override serialize(): Types.Serialization.BuildingSerialized {
		return {
			...super.serialize(),
			entityType: "Building",
			name: this.name,
			offset: this.offset,
			staticType: this.staticType,
			repairCost: this.repairCost,
			repairScore: this.#repairScore,
		};
	}
}
