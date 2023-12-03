import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { world } from "../world";
import { GroundGroup } from "./GroundGroup";
import { Unit, UnitProps } from "./Unit";

export interface GroundUnitProps extends UnitProps {
	name: string;
	category: Types.Campaign.GroundUnitCategory;
	groundGroup: GroundGroup;
}
export class GroundUnit extends Unit {
	name: string;
	alive = true;
	category: Types.Campaign.GroundUnitCategory;
	groundGroup: GroundGroup;

	constructor(args: GroundUnitProps) {
		super({ ...args, queries: new Set(["groundUnits"]) });
		this.name = args.name;
		this.category = args.category;
		this.groundGroup = args.groundGroup;
	}

	static generate(coalition: DcsJs.Coalition, groundGroup: GroundGroup, groupType: DcsJs.CampaignGroundGroupType) {
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
				groundGroup,
				name,
			};
		});

		const infantryTemplates: Array<GroundUnitProps> = template.infantries.map((name) => {
			return {
				category: "infantry",
				coalition,
				groundGroup,
				name,
			};
		});

		const armorShoradTemplates: Array<GroundUnitProps> = template.shoradVehicles.map((name) => {
			return {
				category: "air defense",
				coalition,
				groundGroup,
				name,
			};
		});

		const infantryShoradTemplates: Array<GroundUnitProps> = template.shoradInfantries.map((name) => {
			return {
				category: "air defense",
				coalition,
				groundGroup,
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
					const unit = new GroundUnit(unitTemplate);

					groundUnits.push(unit);
				}
			});
		}

		if (groupTypeShoradTemplates.length > 0) {
			const length = Utils.Random.number(0, 100) > 60 ? 1 : 0;
			Array.from({ length }, () => {
				const unitTemplate = Utils.Random.item(groupTypeShoradTemplates);

				if (unitTemplate) {
					const unit = new GroundUnit(unitTemplate);

					shoradGroundUnits.push(unit);
				}
			});
		}

		return { groundUnits, shoradGroundUnits };
	}

	override toJSON(): Types.Campaign.GroundUnitItem {
		return {
			...super.toJSON(),
			name: this.name,
			category: this.category,
			alive: this.alive,
		};
	}
}
