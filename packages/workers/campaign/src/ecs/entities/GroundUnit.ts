import * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../utils";
import { QueryKey } from "../store";
import { Unit, UnitProps } from "./_base/Unit";

export interface GroundUnitProps extends Omit<UnitProps, "entityType" | "queries"> {
	name: string;
	category: Types.Campaign.GroundUnitCategory;
}
export class GroundUnit extends Unit<keyof Events.EventMap.GroundUnit> {
	public readonly name: string;
	public readonly type: DcsJs.GroundUnitType;
	public readonly category: Types.Campaign.GroundUnitCategory;

	get definition() {
		return DcsJs.groundUnitDefinitions[this.type];
	}

	private constructor(args: GroundUnitProps | Types.Serialization.GroundUnitSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, entityType: "GroundUnit" as const, queries: ["groundUnits"] as QueryKey[] };
		super(superArgs);
		this.name = args.name;
		this.type = args.name as Types.Serialization.GroundUnitType;
		this.category = args.category;
	}

	static create(args: GroundUnitProps) {
		return new GroundUnit(args);
	}

	override toJSON(): Types.Campaign.GroundUnitItem {
		return {
			...super.toJSON(),
			name: this.name,
			category: this.category,
			alive: this.alive,
		};
	}

	static deserialize(args: Types.Serialization.GroundUnitSerialized) {
		return new GroundUnit(args);
	}

	public override serialize(): Types.Serialization.GroundUnitSerialized {
		return {
			...super.serialize(),
			entityType: "GroundUnit",
			name: this.name,
			category: this.category,
			type: this.type,
		};
	}
}
