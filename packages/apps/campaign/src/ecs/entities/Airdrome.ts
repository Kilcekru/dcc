import * as DcsJs from "@foxdelta2/dcsjs";

import * as Domain from "../../domain";
import { world } from "../world";
import { Aircraft } from "./Aircraft";
import { HomeBase, HomeBaseProps } from "./HomeBase";

export interface AirdromeProps extends Omit<HomeBaseProps, "type"> {
	frequencyList: number[];
}

export class Airdrome extends HomeBase {
	public frequencyList: number[];

	public constructor(args: AirdromeProps) {
		super({ ...args, type: "airdrome" });
		this.frequencyList = args.frequencyList;

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
				position: Domain.Location.objectToPosition(airdrome),
			});
		}
	}
}
