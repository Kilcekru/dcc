import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events } from "../../utils";
import { world } from "../world";
import { HomeBase, HomeBaseProps } from "./_base/HomeBase";

export interface AirdromeProps extends Omit<HomeBaseProps, "entityType" | "type"> {
	frequencyList: number[];
}

export class Airdrome extends HomeBase<keyof Events.EventMap.Airdrome> {
	public readonly frequencyList: number[];

	private constructor(args: AirdromeProps) {
		super({ ...args, entityType: "Airdrome", type: "airdrome", queries: ["airdromes"] });
		this.frequencyList = args.frequencyList;
	}

	static create(args: AirdromeProps) {
		const ad = new Airdrome(args);

		ad.generateAircraftsForHomeBase({ coalition: args.coalition });

		return ad;
	}

	static generate(args: { coalition: DcsJs.Coalition; airdromeNames: Array<string> }) {
		for (const name of args.airdromeNames) {
			const airdrome = world.dataStore?.airdromes?.[name];

			if (airdrome == null) {
				throw new Error(`airdrome: ${name} not found`);
			}

			Airdrome.create({
				coalition: args.coalition,
				frequencyList: airdrome.frequencyList ?? [],
				name: airdrome.name,
				position: Utils.Location.objectToPosition(airdrome),
			});
		}
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
}
