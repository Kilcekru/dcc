import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events } from "../../utils";
import { QueryKey, world } from "../world";
import type { FlightGroup } from "./flight-group";
import { GroundUnit } from "./GroundUnit";
import { Group, GroupProps } from "./Group";
import type { Objective } from "./Objective";
export interface GroundGroupProps extends Omit<GroupProps, "position"> {
	start: Objective;
	target: Objective;
	groupType?: DcsJs.CampaignGroundGroupType;
	embarked?: FlightGroup;
}

export class GroundGroup extends Group<keyof Events.EventMap.GroundGroup> {
	public readonly name: string;
	public readonly start: Objective;
	public readonly target: Objective;
	public readonly type: DcsJs.CampaignGroundGroupType;
	readonly #unitIds: Array<Types.Campaign.Id>;
	public readonly shoradUnits: Array<GroundUnit>;
	#embarkedOntoFlightGroup: FlightGroup | undefined;

	get units(): Array<GroundUnit> {
		return this.#unitIds.map((id) => world.getEntity<GroundUnit>(id));
	}

	get aliveUnits(): Array<GroundUnit> {
		return this.units.filter((u) => u.alive);
	}

	constructor(args: GroundGroupProps) {
		const queries: Set<QueryKey> = new Set(["groundGroups", "mapEntities"]);

		// If the group is not already at the target, add it to the en route query
		if (args.start === args.target) {
			queries.add("groundGroups-on target");
		} else {
			queries.add("groundGroups-en route");
		}

		super({ ...args, queries, position: args.start.position });
		this.name = args.target.name + "-" + this.id;
		this.start = args.start;
		this.target = args.target;
		this.#embarkedOntoFlightGroup = args.embarked;
		const randomNumber = Utils.Random.number(1, 100);
		const groupType = randomNumber > 50 ? "armor" : "infantry";

		const { groundUnits, shoradGroundUnits } = GroundUnit.generate(args.coalition, this, groupType);
		this.type = groupType;
		this.#unitIds = groundUnits.map((u) => u.id);
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

	move(worldDelta: number) {
		const heading = Utils.Location.headingToPosition(this.position, this.target.position);
		// Calculate the distance traveled in meters in the tick
		const distanceTraveled = Math.round(Utils.DateTime.toSeconds(worldDelta) * Utils.Config.defaults.groundGroupSpeed);
		// Calculate the new position
		this.position = Utils.Location.positionFromHeading(this.position, heading, distanceTraveled);
	}

	destroyUnit(unit: GroundUnit) {
		unit.destroy();

		if (this.aliveUnits.length === 0) {
			this.destructor();

			return true;
		}

		return false;
	}

	/**
	 * If the group is at the target
	 */
	moveOntoTarget() {
		this.position = this.target.position;
		this.removeFromQuery("groundGroups-en route");
	}

	/**
	 * Embark the group onto the flight group
	 */
	embark(flightGroup: FlightGroup) {
		if (this.#embarkedOntoFlightGroup != null) {
			throw new Error("Group is already embarked");
		}

		this.moveSubQuery("groundGroups", "en route", "embarked");
		this.removeFromQuery("mapEntities");
		this.#embarkedOntoFlightGroup = flightGroup;
	}

	/**
	 * Disebark the group from the flight group
	 */
	disembark() {
		if (this.#embarkedOntoFlightGroup == null) {
			throw new Error("Group is not embarked");
		}

		this.moveSubQuery("groundGroups", "embarked", "en route");
		this.addToQuery("mapEntities");
		this.position = this.#embarkedOntoFlightGroup.position;
		this.#embarkedOntoFlightGroup = undefined;
	}

	override destructor() {
		this.units.forEach((u) => u.destructor());
		this.shoradUnits.forEach((u) => u.destructor());
		super.destructor();
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
