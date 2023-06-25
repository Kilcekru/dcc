import * as DcsJs from "@foxdelta2/dcsjs";
import { DataStore } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Scenario } from "../../data";
import { randomItem } from "../../utils";

export const generateGroundUnitsInventory = (
	faction: DcsJs.FactionDefinition,
	coalition: DcsJs.CampaignCoalition,
	scenario: Scenario,
	dataStore: DataStore
) => {
	const template = dataStore.groundUnitsTemplates?.find((t) => faction.templateName === t.name);

	if (template == null) {
		throw new Error(`generateGroundUnitsInventory: ground units template: ${faction.templateName} not found`);
	}

	const vehicles: Array<DcsJs.CampaignUnit> = template.vehicles.map((name) => {
		return {
			id: "",
			name: name,
			displayName: name,
			alive: true,
			category: "Armor",
			state: "idle",
			vehicleTypes: ["Armored"],
		};
	});

	const infantries: Array<DcsJs.CampaignUnit> = template.infantries.map((name) => {
		return {
			id: "",
			name: name,
			displayName: name,
			alive: true,
			category: "Infantry",
			state: "idle",
			vehicleTypes: ["Infantry"],
		};
	});

	const shoradVehicles: Array<DcsJs.CampaignUnit> = template.shoradVehicles.map((name) => {
		return {
			id: "",
			name,
			displayName: name,
			alive: true,
			category: "Air Defence",
			state: "idle",
			vehicleTypes: ["SHORAD"],
		};
	});

	const shoradInfantries: Array<DcsJs.CampaignUnit> = template.shoradInfantries.map((name) => {
		return {
			id: "",
			name,
			displayName: name,
			alive: true,
			category: "Air Defence",
			state: "idle",
			vehicleTypes: ["SHORAD", "Infantry"],
		};
	});

	const groundUnits: Record<string, DcsJs.CampaignUnit> = {};

	if (vehicles.length > 0) {
		const unitCount = 140 / vehicles.length;

		vehicles.forEach((unit) => {
			Array.from({ length: unitCount }, () => {
				const id = createUniqueId();

				groundUnits[id] = {
					...unit,
					id,
					displayName: `${unit.name}|${id}`,
				};
			});
		});
	}

	if (infantries.length > 0) {
		const unitCount = 200 / infantries.length;

		infantries.forEach((unit) => {
			Array.from({ length: unitCount }, () => {
				const id = createUniqueId();

				groundUnits[id] = {
					...unit,
					id,
					displayName: `${unit.name}|${id}`,
				};
			});
		});
	}

	if (shoradVehicles.length > 0) {
		const unitCount = 60 / shoradVehicles.length;

		shoradVehicles.forEach((unit) => {
			Array.from({ length: unitCount }, () => {
				const id = createUniqueId();

				groundUnits[id] = {
					...unit,
					id,
					displayName: `${unit.name}|${id}`,
				};
			});
		});
	}

	if (shoradInfantries.length > 0) {
		const unitCount = 50 / shoradVehicles.length;

		shoradInfantries.forEach((unit) => {
			Array.from({ length: unitCount }, () => {
				const id = createUniqueId();

				groundUnits[id] = {
					...unit,
					id,
					displayName: `${unit.name}|${id}`,
				};
			});
		});
	}

	scenario[coalition === "blue" ? "blue" : "red"].objectivePlans.forEach((plan) => {
		const hasEWR = plan.groundUnitTypes.some((gut) => gut === "ewr");

		if (!hasEWR) {
			return;
		}

		const name = randomItem(template.ews);

		if (name == null) {
			return;
		}

		const id = createUniqueId();
		const unit: DcsJs.CampaignUnit = {
			id,
			name: name,
			displayName: `${name}|${id}`,
			alive: true,
			category: "Air Defence",
			state: "idle",
			vehicleTypes: ["Unarmored", "EW"],
		};

		groundUnits[id] = unit;
	});

	return groundUnits;
};
