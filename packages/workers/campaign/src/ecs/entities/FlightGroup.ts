import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Task } from "../components";
import { world } from "../world";
import { Aircraft } from "./Aircraft";
import { GroundGroup } from "./GroundGroup";
import { Group, GroupProps } from "./Group";
import { HomeBase } from "./HomeBase";
import { Package } from "./Package";
import { Structure } from "./Structure";
import { Waypoint } from "./Waypoint";

const calcNumber = (
	coalition: DcsJs.Coalition,
	base: string,
	index: number,
	number: number,
): { flightGroup: string; unit: { name: string; index: number; number: number } } => {
	const tmp = `${base}-${number}`;

	let callSignFg: FlightGroup | undefined;

	for (const fg of world.queries.flightGroups[coalition]) {
		if (fg.name === tmp) {
			callSignFg = fg;
			break;
		}
	}

	if (callSignFg == null) {
		return {
			flightGroup: tmp,
			unit: {
				name: base,
				index,
				number,
			},
		};
	}

	return calcNumber(coalition, base, index, number + 1);
};

export const generateCallSign = (coalition: DcsJs.Coalition, type: "aircraft" | "helicopter" | "awacs") => {
	const ds = world.dataStore;

	if (ds == null) {
		throw new Error("dataStore not initialized");
	}

	const { name, index } = Utils.Random.callSign(ds, type);

	const number = calcNumber(coalition, name, index, 1);

	return {
		unitCallSign: (index: number) => {
			return {
				"1": number.unit.index,
				"2": number.unit.number,
				"3": index + 1,
				name: `${number.unit.name}${number.unit.number}${index + 1}`,
			};
		},
		unitName: (index: number) => `${number.flightGroup}-${index + 1}`,
		flightGroupName: number.flightGroup,
	};
};

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
	public startTime: number;
	public name: string;

	public constructor(args: FlightGroupProps) {
		super({ ...args, queries: ["flightGroups"] });

		const cs = generateCallSign(args.coalition, "aircraft");
		this.task = args.task;
		this.package = args.package;
		this.waypoints = args.waypoints;
		this.startTime = Utils.DateTime.toFullMinutes(world.time + Utils.DateTime.Minutes(Utils.Random.number(15, 25)));
		this.name = cs.flightGroupName;

		args.package.flightGroups.add(this);
	}

	public addAircraft(aircraft: Aircraft) {
		aircraft.flightGroup = this;
		this.aircrafts.add(aircraft);
	}

	override toJSON(): Types.Campaign.FlightGroupItem {
		return {
			startTime: this.startTime,
			name: this.name,
			task: this.task,
			coalition: this.coalition,
			id: this.id,
		};
	}
}

interface CapFlightGroupProps extends Omit<FlightGroupProps, "task"> {
	target: HomeBase;
}

export class CapFlightGroup extends FlightGroup {
	target: HomeBase;

	public constructor(args: CapFlightGroupProps) {
		super({ ...args, task: "CAP" });
		this.target = args.target;

		this.world.queries.flightGroups[this.coalition].add(this, ["CAP"]);
	}
}

export function isCapFlightGroup(value: FlightGroup): value is CapFlightGroup {
	return (value as CapFlightGroup).task === "CAP";
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
