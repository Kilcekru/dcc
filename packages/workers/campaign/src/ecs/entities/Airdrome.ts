import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../utils";
import { QueryKey } from "../store";
import { HomeBase, HomeBaseProps } from "./_base/HomeBase";

export interface AirdromeProps extends Omit<HomeBaseProps, "entityType" | "type"> {
	frequencyList: number[];
}

export class Airdrome extends HomeBase<keyof Events.EventMap.Airdrome> {
	public readonly frequencyList: number[];

	private constructor(args: AirdromeProps | Serialization.AirdromeSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, type: "airdrome" as const, entityType: "Airdrome" as const, queries: ["airdromes"] as QueryKey[] };
		super(superArgs);
		this.frequencyList = args.frequencyList;
	}

	static create(args: AirdromeProps) {
		const ad = new Airdrome(args);

		ad.generateAircraftsForHomeBase({ coalition: args.coalition });

		return ad;
	}

	override toMapJSON(): Types.Campaign.MapItem {
		return {
			...super.toMapJSON(),
			coalition: this.coalition,
			type: "airdrome",
			name: this.name,
		};
	}

	override toJSON() {
		return {
			...super.toJSON(),
			frequencyList: this.frequencyList,
			name: this.name,
		};
	}

	static deserialize(args: Serialization.AirdromeSerialized) {
		return new Airdrome(args);
	}

	public override serialize(): Serialization.AirdromeSerialized {
		return {
			...super.serialize(),
			entityType: "Airdrome",
			frequencyList: this.frequencyList,
		};
	}
}
