import * as Types from "@kilcekru/dcc-shared-types";

import { Group, GroupProps } from "./Group";
import { Objective } from "./Objective";
export interface GroundGroupProps extends GroupProps {
	name: string;
	start: Objective;
	target: Objective;
}

export class GroundGroup extends Group {
	public name: string;
	public start: Objective;
	public target: Objective;

	public constructor(args: GroundGroupProps) {
		super({ ...args, queries: ["groundGroups"] });
		this.name = args.name;
		this.start = args.start;
		this.target = args.target;
	}

	override toMapJSON(): Types.Campaign.MapItem {
		return {
			...super.toMapJSON(),
			name: this.name,
			type: "groundGroup",
		};
	}
}
