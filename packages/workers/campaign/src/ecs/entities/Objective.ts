import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { DynamicObjectivePlan } from "../../../../../apps/campaign/src/logic/createCampaign/utils";
import { Coalition, Position } from "../components";
import { world } from "../world";
import { GroundGroup } from "./GroundGroup";

export class Objective implements Coalition, Position {
	public name: string;
	public coalition: DcsJs.Coalition;
	public position: DcsJs.Position;
	public incomingGroundGroup: GroundGroup | undefined;

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

	toJSON(): Types.Campaign.ObjectiveItem {
		return {
			name: this.name,
			coalition: this.coalition,
			position: this.position,
			incomingGroundGroup: this.incomingGroundGroup?.id,
		};
	}
}
