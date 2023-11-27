import * as DcsJs from "@foxdelta2/dcsjs";

import { DynamicObjectivePlan } from "../../logic/createCampaign/utils";
import { Coalition, Position } from "../components";
import { world } from "../world";

export class Objective implements Coalition, Position {
	public name: string;
	public coalition: DcsJs.Coalition;
	public position: DcsJs.Position;

	public constructor(args: { name: string; coalition: DcsJs.Coalition; position: DcsJs.Position }) {
		this.name = args.name;
		this.coalition = args.coalition;
		this.position = args.position;

		world.objectives.set(this.name, this);
	}

	public static generate(args: { blueOps: Array<DynamicObjectivePlan>; redOps: Array<DynamicObjectivePlan> }) {
		const objectives = world.dataStore?.objectives;
		if (objectives == null) {
			throw new Error("createObjectives: dataStore is not fetched");
		}

		for (const objective of objectives) {
			const isBlue = args.blueOps.some((obj) => obj.objectiveName === objective.name);
			const isRed = args.redOps.some((obj) => obj.objectiveName === objective.name);

			if (!isBlue && !isRed) {
				continue;
			}

			new Objective({
				coalition: isBlue ? "blue" : "red",
				name: objective.name,
				position: objective.position,
			});
		}
	}
}
