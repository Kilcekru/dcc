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
		super({ ...args, queries: new Set(["groundGroups"]) });
		this.name = args.name;
		this.start = args.start;
		this.target = args.target;
	}

	toMapJSON(): Types.Campaign.MapItem {
		return {
			coalition: this.coalition,
			position: this.position,
			name: this.name,
			type: "groundGroup",
		};
	}

	override toJSON(): Types.Campaign.GroundGroupItem {
		return {
			...super.toJSON(),
			name: this.name,
			start: this.start.name,
			target: this.target.name,
		};
	}
}
