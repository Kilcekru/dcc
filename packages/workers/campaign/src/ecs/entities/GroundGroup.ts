import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Events, Serialization } from "../../utils";
import { getEntity, QueryKey, store } from "../store";
import { Group, GroupProps } from "./_base/Group";
import type { FlightGroup } from "./flight-group";
import { GroundUnit, GroundUnitProps } from "./GroundUnit";
import { Objective } from "./Objective";
export interface GroundGroupProps extends Omit<GroupProps, "entityType" | "queries" | "position"> {
	start: Objective;
	target: Objective;
	type: DcsJs.CampaignGroundGroupType;
	embarked?: FlightGroup;
	unitIds: Array<Types.Campaign.Id>;
	shoradUnitIds: Array<Types.Campaign.Id>;
}

export class GroundGroup extends Group<keyof Events.EventMap.GroundGroup> {
	readonly #startId: Types.Campaign.Id;
	readonly #targetId: Types.Campaign.Id;
	public readonly type: DcsJs.CampaignGroundGroupType;
	readonly #unitIds: Array<Types.Campaign.Id>;
	readonly #shoradUnitIds: Array<Types.Campaign.Id>;
	#embarkedOntoFlightGroupId: Types.Campaign.Id | undefined;
	#listenersTrys = 0;

	get target(): Objective {
		return getEntity<Objective>(this.#targetId);
	}

	get units(): Array<GroundUnit> {
		return this.#unitIds.map((id) => getEntity<GroundUnit>(id));
	}

	get aliveUnits(): Array<GroundUnit> {
		return this.units.filter((u) => u.alive);
	}

	get alive() {
		return this.aliveUnits.length > 0;
	}

	get shoradUnits(): Array<GroundUnit> {
		return this.#shoradUnitIds.map((id) => getEntity<GroundUnit>(id));
	}

	get embarkedOntoFlightGroup() {
		if (this.#embarkedOntoFlightGroupId == null) {
			return undefined;
		}

		return getEntity<FlightGroup>(this.#embarkedOntoFlightGroupId);
	}

	private constructor(args: GroundGroupProps | Types.Serialization.GroundGroupSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: {
					...args,
					...args,
					entityType: "GroundGroup" as const,
					queries: [
						"groundGroups",
						"mapEntities",
						// If the group is not already at the target, add it to the en route query
						args.start === args.target ? "groundGroups-on target" : "groundGroups-en route",
					] as QueryKey[],
					position: args.start.position,
			  };
		super(superArgs);

		if (Serialization.isSerialized(args)) {
			this.#embarkedOntoFlightGroupId = args.embarkedOntoFlightGroupId;
			this.#startId = args.startId;
			this.#targetId = args.targetId;
		} else {
			this.#startId = args.start.id;
			this.#targetId = args.target.id;
		}

		this.type = args.type;
		this.#unitIds = args.unitIds;
		this.#shoradUnitIds = args.shoradUnitIds;

		this.#addListener();
	}

	static create(
		args: Pick<GroundGroupProps, "coalition" | "embarked" | "start" | "target"> &
			Partial<Pick<GroundGroupProps, "type">>,
	) {
		const randomNumber = Utils.Random.number(1, 100);
		const groupType = args.type ?? randomNumber > 50 ? "armor" : "infantry";

		const { groundUnits, shoradGroundUnits } = this.generateUnits(args.coalition, groupType);

		return new GroundGroup({
			...args,
			name: args.target.name + "-" + groupType,
			type: groupType,
			unitIds: groundUnits.map((u) => u.id),
			shoradUnitIds: shoradGroundUnits.map((u) => u.id),
		});
	}

	static generateUnits(coalition: DcsJs.Coalition, groupType: DcsJs.CampaignGroundGroupType) {
		const template = store.dataStore?.groundUnitsTemplates?.find(
			(t) => store.factionDefinitions[coalition]?.templateName === t.name,
		);

		if (template == null) {
			throw new Error(
				`ground units template: ${store.factionDefinitions[coalition]?.templateName ?? "unknown"} not found`,
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
				category: "shorad",
				coalition,
				name,
			};
		});

		const infantryShoradTemplates: Array<GroundUnitProps> = template.shoradInfantries.map((name) => {
			return {
				category: "shorad",
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

	fire(target: GroundGroup) {
		target.destroyUnit();
	}

	destroyUnit() {
		const unit = Utils.Random.item(this.aliveUnits);

		if (unit == null) {
			return;
		}

		const randomNumber = Utils.Random.number(1, 100);
		const hitChance = Utils.Config.combat.g2g.hitChange;

		if (randomNumber <= hitChance) {
			unit.destroy();
		}
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

	// TODO
	#addListener() {
		try {
			for (const unit of this.units) {
				unit.on("destroyed", () => {
					if (!this.alive) {
						this.destructor();
					}
				});
			}
		} catch (e) {
			if (this.#listenersTrys <= 3) {
				this.#listenersTrys++;
				// eslint-disable-next-line no-console
				console.log("Ground Group listener error, trying again", e);
				setTimeout(() => this.#addListener(), 1);
			} else {
				throw e;
			}
		}
	}
	override destructor() {
		this.units.forEach((u) => u.destructor());
		this.shoradUnits.forEach((u) => u.destructor());

		const targetObjective = this.target;
		if (targetObjective.incomingGroundGroup?.id === this.id) {
			targetObjective.incomingGroundGroup = undefined;
		}

		super.destructor();
	}

	override toMapJSON(): Types.Campaign.GroundGroupMapItem {
		return {
			...super.toMapJSON(),
			type: "groundGroup",
			groundGroupType: this.type,
		};
	}

	override toJSON(): Types.Campaign.GroundGroupItem {
		return {
			...super.toJSON(),
			name: this.name,
			start: this.#startId,
			target: this.#targetId,
			type: this.type,
			units: this.units.map((u) => u.toJSON()),
			shoradUnits: this.shoradUnits.map((u) => u.toJSON()),
		};
	}

	static deserialize(args: Types.Serialization.GroundGroupSerialized) {
		return new GroundGroup(args);
	}

	override serialize(): Types.Serialization.GroundGroupSerialized {
		return {
			...super.serialize(),
			entityType: "GroundGroup",
			name: this.name,
			startId: this.#startId,
			targetId: this.#targetId,
			type: this.type,
			unitIds: this.#unitIds,
			shoradUnitIds: this.#shoradUnitIds,
			embarkedOntoFlightGroupId: this.#embarkedOntoFlightGroupId,
		};
	}
}
