import * as DcsJs from "@foxdelta2/dcsjs";

import { Position } from "../components";

export interface WaypointProps extends Position {
	name: string;
	onGround: boolean;
}

export class Waypoint implements Position {
	public name: string;
	public position: DcsJs.Position;
	public onGround: boolean;

	constructor(args: WaypointProps) {
		this.name = args.name;
		this.position = args.position;
		this.onGround = args.onGround;
	}
}

export interface HoldWaypointProps extends WaypointProps {
	duration: number;
}

export class HoldWaypoint extends Waypoint {
	public duration: number;

	constructor(args: HoldWaypointProps) {
		super(args);
		this.duration = args.duration;
	}
}
