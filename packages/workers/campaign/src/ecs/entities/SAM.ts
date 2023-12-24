import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "..";
import { MapEntity, MapEntityProps } from "./_base";
import { Objective } from "./Objective";

export interface SAMProps extends Omit<MapEntityProps, "entityType"> {
	name: string;
	objective: Objective;
	range: number;
	type: DcsJs.SamType;
}

export class SAM extends MapEntity {
	public readonly name: string;
	public readonly range: number;
	public readonly objective: Objective;
	public readonly type: DcsJs.SamType;

	private constructor(args: SAMProps) {
		super({ ...args, entityType: "SAM", queries: ["SAMs"] });
		this.name = args.name;
		this.range = args.range;
		this.objective = args.objective;
		this.type = args.type;
	}

	static create(args: SAMProps) {
		return new SAM(args);
	}

	static generate(args: { coalition: DcsJs.Coalition; objectivePlans: Array<Types.Campaign.ObjectivePlan> }) {
		const strikeTargets = world.dataStore?.strikeTargets;

		if (strikeTargets == null) {
			throw new Error("strikeTargets not found");
		}

		for (const plan of args.objectivePlans) {
			// Get only the plans with SAMs
			const withSam = plan.groundUnitTypes.some((gut) => gut === "sam");

			if (!withSam) {
				continue;
			}

			// Get the targets for the plan
			const targets = strikeTargets[plan.objectiveName];

			if (targets == null) {
				continue;
			}

			// Select a SAM target
			const samTargets = targets.filter((target) => target.type === "SAM");

			const selectedSamTarget = Utils.Random.item(samTargets);

			if (selectedSamTarget == null) {
				continue;
			}

			// Create the SAM
		}
	}
}
