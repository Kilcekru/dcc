import { world } from "../world";
import { Group, GroupProps } from "./Group";
import { Objective } from "./Objective";

export interface GroundGroupProps extends GroupProps {
	start: Objective;
	target: Objective;
}

export class GroundGroup extends Group {
	public start: Objective;
	public target: Objective;

	public constructor(args: GroundGroupProps) {
		super(args);
		this.start = args.start;
		this.target = args.target;

		world.queries.groundGroups[args.coalition].add(this);
	}
}
