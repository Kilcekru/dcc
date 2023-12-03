import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { QueryKey, world } from "../world";
import { GroundUnit } from "./GroundUnit";
import { Group, GroupProps } from "./Group";
import { Objective } from "./Objective";
export interface GroundGroupProps extends Omit<GroupProps, "position"> {
	start: Objective;
	target: Objective;
	groupType?: DcsJs.CampaignGroundGroupType;
}

export class GroundGroup extends Group {
	public name: string;
	public start: Objective;
	public target: Objective;
	public type: DcsJs.CampaignGroundGroupType;
	public units: Array<GroundUnit>;
	public shoradUnits: Array<GroundUnit>;

	constructor(args: GroundGroupProps) {
		const queries: Set<QueryKey> = new Set(["groundGroups", "mapEntities"]);

		if (args.start !== args.target) {
			queries.add("groundGroups-en route");
		}

		super({ ...args, queries, position: args.start.position });
		this.name = args.target.name + "-" + this.id;
		this.start = args.start;
		this.target = args.target;
		const randomNumber = Utils.Random.number(1, 100);
		const groupType = randomNumber > 50 ? "armor" : "infantry";

		const { groundUnits, shoradGroundUnits } = GroundUnit.generate(args.coalition, this, groupType);
		this.type = groupType;
		this.units = groundUnits;
		this.shoradUnits = shoradGroundUnits;
	}

	static generate(args: { coalition: DcsJs.Coalition; objectivePlans: Array<Types.Campaign.ObjectivePlan> }) {
		for (const plan of args.objectivePlans) {
			if (plan.groundUnitTypes.some((gut) => gut === "vehicles")) {
				const obj = world.objectives.get(plan.objectiveName);

				if (obj == null) {
					throw new Error(`Objective ${plan.objectiveName} not found`);
				}

				new GroundGroup({
					coalition: args.coalition,
					start: obj,
					target: obj,
				});
			}
		}
	}

	toMapJSON(): Types.Campaign.MapItem {
		return {
			coalition: this.coalition,
			position: this.position,
			name: this.name,
			type: "groundGroup",
			groundGroupType: this.type,
		};
	}

	override toJSON(): Types.Campaign.GroundGroupItem {
		return {
			...super.toJSON(),
			name: this.name,
			start: this.start.name,
			target: this.target.name,
			type: this.type,
			units: this.units.map((u) => u.toJSON()),
			shoradUnits: this.shoradUnits.map((u) => u.toJSON()),
		};
	}
}
