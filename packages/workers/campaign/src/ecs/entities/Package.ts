import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition, Task } from "../components";
import { Entity } from "./Entity";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

export interface PackageProps {
	coalition: DcsJs.Coalition;
	task: DcsJs.Task;
}

export class Package extends Entity implements Coalition, Task {
	public flightGroups: Set<FlightGroup> = new Set();
	public task: DcsJs.Task;

	public constructor(args: PackageProps) {
		super({
			coalition: args.coalition,
			queries: ["packages"],
		});
		this.coalition = args.coalition;
		this.task = args.task;

		this.world.queries.packages[this.coalition].add(this, ["CAP"]);
	}

	public createFlightGroup(args: Omit<FlightGroupProps, "package">) {
		const fg = new FlightGroup({ ...args, package: this });
		this.flightGroups.add(fg);

		return fg;
	}
}
