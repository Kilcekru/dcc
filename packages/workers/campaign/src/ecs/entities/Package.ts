import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition, Task } from "../components";
import { FlightGroup, FlightGroupProps } from "./FlightGroup";

export interface PackageProps {
	coalition: DcsJs.Coalition;
	task: DcsJs.Task;
}

export class Package implements Coalition, Task {
	public flightGroups: Set<FlightGroup> = new Set();
	public coalition: DcsJs.Coalition;
	public task: DcsJs.Task;

	public constructor(args: PackageProps) {
		this.coalition = args.coalition;
		this.task = args.task;
	}

	public createFlightGroup(args: Omit<FlightGroupProps, "package">) {
		const fg = new FlightGroup({ ...args, package: this });
		this.flightGroups.add(fg);

		return fg;
	}
}
