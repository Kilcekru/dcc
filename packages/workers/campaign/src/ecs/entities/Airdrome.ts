import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "../world";
import { Aircraft } from "./Aircraft";
import { HomeBase, HomeBaseProps } from "./HomeBase";

export interface AirdromeProps extends Omit<HomeBaseProps, "type"> {
	frequencyList: number[];
}

export class Airdrome extends HomeBase {
	public frequencyList: number[];

	public constructor(args: AirdromeProps) {
		super({ ...args, type: "airdrome", queries: ["airdromes"] });
		this.frequencyList = args.frequencyList;
		this.name = args.name;

		world.queries.airdromes[args.coalition].add(this);

		Aircraft.generateAircraftsForAirdrome({
			coalition: args.coalition,
			airdrome: this,
		});
	}

	static generate(args: { coalition: DcsJs.Coalition; airdromeNames: Array<string> }) {
		for (const name of args.airdromeNames) {
			const airdrome = world.dataStore?.airdromes?.[name];

			if (airdrome == null) {
				throw new Error(`airdrome: ${name} not found`);
			}

			new Airdrome({
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
}
