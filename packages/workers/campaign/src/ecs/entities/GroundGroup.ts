import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events } from "../../utils";
import { world } from "../world";
import { Group, GroupProps } from "./_base/Group";
import type { FlightGroup } from "./flight-group";
import { GroundUnit, GroundUnitProps } from "./GroundUnit";
import type { Objective } from "./Objective";
export interface GroundGroupProps extends Omit<GroupProps, "entityType" | "queries" | "position"> {
	start: Objective;
	target: Objective;
	groupType: DcsJs.CampaignGroundGroupType;
	embarked?: FlightGroup;
	unitIds: Array<Types.Campaign.Id>;
	shoradUnitIds: Array<Types.Campaign.Id>;
}

export class GroundGroup extends Group<keyof Events.EventMap.GroundGroup> {
	public readonly name: string;
	public readonly start: Objective;
	public readonly target: Objective;
	public readonly type: DcsJs.CampaignGroundGroupType;
	readonly #unitIds: Array<Types.Campaign.Id>;
	readonly #shoradUnitIds: Array<Types.Campaign.Id>;
	#embarkedOntoFlightGroupId: Types.Campaign.Id | undefined;

	get units(): Array<GroundUnit> {
		return this.#unitIds.map((id) => world.getEntity<GroundUnit>(id));
	}

	get aliveUnits(): Array<GroundUnit> {
		return this.units.filter((u) => u.alive);
	}

	get shoradUnits(): Array<GroundUnit> {
		return this.#shoradUnitIds.map((id) => world.getEntity<GroundUnit>(id));
	}

	get embarkedOntoFlightGroup() {
		if (this.#embarkedOntoFlightGroupId == null) {
			return undefined;
		}

		return world.getEntity<FlightGroup>(this.#embarkedOntoFlightGroupId);
	}

	private constructor(args: GroundGroupProps) {
		super({
			...args,
			entityType: "GroundGroup",
			queries: [
				"groundGroups",
				"mapEntities",
				// If the group is not already at the target, add it to the en route query
				args.start === args.target ? "groundGroups-on target" : "groundGroups-en route",
			],
			position: args.start.position,
		});
		this.name = args.target.name + "-" + this.id;
		this.start = args.start;
		this.target = args.target;

		this.type = args.groupType;
		this.#unitIds = args.unitIds;
		this.#shoradUnitIds = args.shoradUnitIds;
	}

	static create(
		args: Pick<GroundGroupProps, "coalition" | "embarked" | "start" | "target"> &
			Partial<Pick<GroundGroupProps, "groupType">>,
	) {
		const randomNumber = Utils.Random.number(1, 100);
		const groupType = args.groupType ?? randomNumber > 50 ? "armor" : "infantry";

		const { groundUnits, shoradGroundUnits } = this.generateUnits(args.coalition, groupType);

		return new GroundGroup({
			...args,
			groupType,
			unitIds: groundUnits.map((u) => u.id),
			shoradUnitIds: shoradGroundUnits.map((u) => u.id),
		});
	}

	static generate(args: { coalition: DcsJs.Coalition; objectivePlans: Array<Types.Campaign.ObjectivePlan> }) {
		for (const plan of args.objectivePlans) {
			if (plan.groundUnitTypes.some((gut) => gut === "vehicles")) {
				const obj = world.objectives.get(plan.objectiveName);

				if (obj == null) {
					throw new Error(`Objective ${plan.objectiveName} not found`);
				}

				GroundGroup.create({
					coalition: args.coalition,
					start: obj,
					target: obj,
				});
			}
		}
	}

	static generateUnits(coalition: DcsJs.Coalition, groupType: DcsJs.CampaignGroundGroupType) {
		const template = world.dataStore?.groundUnitsTemplates?.find(
			(t) => world.factionDefinitions[coalition]?.templateName === t.name,
		);

		if (template == null) {
			throw new Error(
				`ground units template: ${world.factionDefinitions[coalition]?.templateName ?? "unknown"} not found`,
			);
		}

		const armorTemplates: Array<GroundUnitProps> = template.vehicles.map((name) => {
			return {
				category: "armor",
				coalition,
				name,
			};
		});

		const infantryTemplates: Array<GroundUnitProps> = template.infantries.map((name) => {
			return {
				category: "infantry",
				coalition,
				name,
			};
		});

		const armorShoradTemplates: Array<GroundUnitProps> = template.shoradVehicles.map((name) => {
			return {
				category: "air defense",
				coalition,
				name,
			};
		});

		const infantryShoradTemplates: Array<GroundUnitProps> = template.shoradInfantries.map((name) => {
			return {
				category: "air defense",
				coalition,
				name,
			};
		});

		const groupTypeTemplates = groupType === "armor" ? armorTemplates : infantryTemplates;
		const groupTypeShoradTemplates = groupType === "armor" ? armorShoradTemplates : infantryShoradTemplates;

		const groundUnits: Array<GroundUnit> = [];
		const shoradGroundUnits: Array<GroundUnit> = [];

		if (groupTypeTemplates.length > 0) {
			Array.from({ length: 8 }, () => {
				const unitTemplate = Utils.Random.item(groupTypeTemplates);

				if (unitTemplate) {
					const unit = GroundUnit.create(unitTemplate);

					groundUnits.push(unit);
				}
			});
		}

		if (groupTypeShoradTemplates.length > 0) {
			const length = Utils.Random.number(0, 100) > 60 ? 1 : 0;
			Array.from({ length }, () => {
				const unitTemplate = Utils.Random.item(groupTypeShoradTemplates);

				if (unitTemplate) {
					const unit = GroundUnit.create(unitTemplate);

					shoradGroundUnits.push(unit);
				}
			});
		}

		return { groundUnits, shoradGroundUnits };
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
		if (this.#embarkedOntoFlightGroupId != null) {
			throw new Error("Group is already embarked");
		}

		this.moveSubQuery("groundGroups", "en route", "embarked");
		this.removeFromQuery("mapEntities");
		this.#embarkedOntoFlightGroupId = flightGroup.id;
	}

	/**
	 * Disebark the group from the flight group
	 */
	disembark() {
		if (this.embarkedOntoFlightGroup == null) {
			throw new Error("Group is not embarked");
		}

		this.moveSubQuery("groundGroups", "embarked", "en route");
		this.addToQuery("mapEntities");
		this.position = this.embarkedOntoFlightGroup.position;
		this.#embarkedOntoFlightGroupId = undefined;
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
