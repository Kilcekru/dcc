import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { Serialization } from "../../utils";
import { getEntity, QueryKey, store } from "../store";
import { FlightGroup, Group, GroupProps } from "./_base";
import { GroundUnit } from "./GroundUnit";
import { Objective } from "./Objective";

export interface SAMProps extends Omit<GroupProps, "entityType"> {
	name: string;
	objectiveId: Types.Campaign.Id;
	type: DcsJs.SamType;
	unitIds: Types.Campaign.Id[];
}

export type CreateSAMProps = Pick<SAMProps, "coalition"> & {
	objective: Objective;
	position: DcsJs.Position;
};

export class SAM extends Group {
	readonly #objectiveId: Types.Campaign.Id;
	public readonly type: DcsJs.SamType;
	readonly #unitIds: Array<Types.Campaign.Id>;
	#cooldownTime: number | undefined;

	get samTemplate() {
		return DcsJs.samTemplates?.[this.type];
	}

	/**
	 * Range of SAM in meters. If the SAM lost the search radar, the range is 10% of the original range.
	 */
	get range() {
		let hasSearchRadar = false;

		for (const unit of this.units) {
			if (unit.alive && unit.definition?.vehicleTypes?.includes("Search Radar")) {
				hasSearchRadar = true;
				break;
			}
		}

		const range = this.samTemplate?.range ?? 1000;

		return hasSearchRadar ? range : range * 0.1;
	}

	get units(): Array<GroundUnit> {
		return this.#unitIds.map((id) => getEntity<GroundUnit>(id));
	}

	get aliveUnits(): Array<GroundUnit> {
		return this.units.filter((u) => u.alive);
	}

	get readyToFire() {
		return this.active && (this.#cooldownTime == null || this.#cooldownTime <= store.time);
	}

	/**
	 * Is SAM active (has both track radar and launcher alive)
	 */
	get active() {
		let hasTrackRadar = false;
		let hasLauncher = false;

		for (const unit of this.units) {
			if (unit.alive) {
				if (unit.definition?.vehicleTypes?.includes("Track Radar")) {
					hasTrackRadar = true;
					continue;
				}
				if (unit.definition?.vehicleTypes?.includes("SAM Launcher")) {
					hasLauncher = true;
				}
			}
		}

		return hasTrackRadar && hasLauncher;
	}

	private constructor(args: SAMProps | Types.Serialization.SAMSerialized) {
		const superArgs = Serialization.isSerialized(args)
			? args
			: { ...args, entityType: "SAM" as const, queries: ["SAMs-active"] as QueryKey[] };
		super(superArgs);
		this.#objectiveId = args.objectiveId;
		this.type = args.type;
		this.#unitIds = args.unitIds;
	}

	static create(args: CreateSAMProps) {
		const template = DcsJs.groundUnitsTemplates?.find(
			(t) => store.factionDefinitions[args.coalition]?.templateName === t.name,
		);

		if (template == null) {
			throw new Error(
				`ground units template: ${store.factionDefinitions[args.coalition]?.templateName ?? "unknown"} not found`,
			);
		}

		const samType = Utils.Random.item(template.sams) as DcsJs.SamType;

		const units = this.generateUnits(args.coalition, samType);

		return new SAM({
			...args,
			objectiveId: args.objective.id,
			position: args.position,
			name: args.objective.name + "-" + samType,
			type: samType,
			unitIds: units.map((u) => u.id),
		});
	}

	static generateUnits(coalition: DcsJs.Coalition, type: DcsJs.SamType) {
		const samTemplate = DcsJs.samTemplates[type];

		const groundUnits: Array<GroundUnit> = [];

		for (const unitName of samTemplate.units) {
			const unit = GroundUnit.create({
				category: "sam",
				coalition,
				name: unitName,
			});

			groundUnits.push(unit);
		}

		return groundUnits;
	}

	public fire(target: FlightGroup, distance: number) {
		const distanceFactor = 1 - distance / this.range;

		if (Utils.Random.number(1, 100) <= 100 * distanceFactor) {
			// eslint-disable-next-line no-console
			console.log("fire at", target.name, "from", this.name);

			if (!target.alive) {
				// eslint-disable-next-line no-console
				throw new Error("target is not alive");
			}

			target.destroyAircraft();
		} else {
			// eslint-disable-next-line no-console
			console.log("miss", target.name, "from", this.name);
		}

		this.#cooldownTime = store.time + (this.samTemplate?.fireInterval ?? 120);
	}

	override toMapJSON(): Types.Campaign.SAMMapItem {
		return {
			...super.toMapJSON(),
			type: "sam",
			range: this.range,
			active: this.active,
		};
	}

	static deserialize(args: Types.Serialization.SAMSerialized) {
		return new SAM(args);
	}

	public override serialize(): Types.Serialization.SAMSerialized {
		return {
			...super.serialize(),
			entityType: "SAM",
			objectiveId: this.#objectiveId,
			type: this.type,
			unitIds: this.#unitIds,
			active: this.active,
		};
	}
}
