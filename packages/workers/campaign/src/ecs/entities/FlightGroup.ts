import * as DcsJs from "@foxdelta2/dcsjs";

import { Task } from "../components";
import { Aircraft } from "./Aircraft";
import { GroundGroup } from "./GroundGroup";
import { Group, GroupProps } from "./Group";
import { Package } from "./Package";
import { Structure } from "./Structure";
import { Waypoint } from "./Waypoint";

export interface FlightGroupProps extends GroupProps {
	task: DcsJs.Task;
	package: Package;
	waypoints: Array<Waypoint>;
}

export class FlightGroup extends Group implements Task {
	public aircrafts: Set<Aircraft> = new Set();
	public task: DcsJs.Task;
	public package: Package;
	public waypoints: Array<Waypoint> = [];

	public constructor(args: FlightGroupProps) {
		super({ ...args, queries: ["flightGroups"] });
		this.task = args.task;
		this.package = args.package;
		this.waypoints = args.waypoints;

		this.world.queries.flightGroups[this.coalition].add(this);
	}

	public addAircraft(aircraft: Aircraft) {
		aircraft.flightGroup = this;
		this.aircrafts.add(aircraft);
	}
}

interface CasFlightGroupProps extends FlightGroupProps {
	target: GroundGroup;
}

export class CasFlightGroup extends FlightGroup {
	target: GroundGroup;

	public constructor(args: CasFlightGroupProps) {
		super(args);
		this.target = args.target;
	}
}

interface StrikeFlightGroupProps extends FlightGroupProps {
	target: Structure;
}

export class StrikeFlightGroup extends FlightGroup {
	target: Structure;

	public constructor(args: StrikeFlightGroupProps) {
		super(args);
		this.target = args.target;
	}
}
