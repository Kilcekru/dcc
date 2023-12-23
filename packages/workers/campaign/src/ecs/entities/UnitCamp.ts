import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import { calcInitDeploymentScore } from "../utils";
import { world } from "../world";
import { Structure, StructureProps } from "./_base/Structure";

export interface UnitCampProps extends Omit<StructureProps, "entityType"> {
	structureType: DcsJs.StructureTypeUnitCamp;
}

export class UnitCamp extends Structure {
	public deploymentScore: number;
	public override structureType: DcsJs.StructureTypeUnitCamp;

	get range() {
		return this.structureType === "Barrack"
			? Utils.Config.structureRange.frontline.barrack
			: Utils.Config.structureRange.frontline.depot;
	}

	get deploymentCost() {
		const baseline =
			this.structureType === "Barrack"
				? Utils.Config.deploymentScore.frontline.barrack
				: Utils.Config.deploymentScore.frontline.depot;

		return baseline * Utils.Config.deploymentScore.coalitionMultiplier[this.coalition];
	}

	get deploymentCostAirAssault() {
		return this.deploymentCost * Utils.Config.deploymentScore.airAssaultMultiplier;
	}

	get hasPower() {
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.structureType === "Power Plant" && structure.alive) {
				if (Utils.Location.inRange(this.position, structure.position, Utils.Config.structureRange.power)) {
					return true;
				}
			}
		}

		return false;
	}

	get hasAmmo() {
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.structureType === "Ammo Depot" && structure.alive) {
				if (Utils.Location.inRange(this.position, structure.position, Utils.Config.structureRange.ammo)) {
					return true;
				}
			}
		}

		return false;
	}

	get hasFuel() {
		for (const structure of world.queries.structures[this.coalition]) {
			if (structure.structureType === "Fuel Storage" && structure.alive) {
				if (Utils.Location.inRange(this.position, structure.position, Utils.Config.structureRange.fuel)) {
					return true;
				}
			}
		}

		return false;
	}

	constructor(args: UnitCampProps) {
		super({ ...args, entityType: "UnitCamp", queries: ["unitCamps"] });
		this.structureType = args.structureType;
		this.deploymentScore = calcInitDeploymentScore(args.coalition, args.structureType);
	}
}
