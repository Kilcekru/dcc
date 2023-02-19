import * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import { Scenario } from "../../data";
import { firstItem, randomItem } from "../../utils";

export const generateGroundUnitsInventory = (
	faction: DcsJs.FactionDefinition,
	coalition: DcsJs.CampaignCoalition,
	scenario: Scenario
) => {
	const vehicleName = firstItem(faction.template.vehicles);

	if (vehicleName == null) {
		throw "vehicle not found";
	}

	const vehicle: DcsJs.CampaignUnit = {
		id: "",
		name: vehicleName,
		displayName: vehicleName,
		alive: true,
		category: "Armor",
		state: "idle",
		vehicleTypes: ["Armored"],
	};

	const infantryName = firstItem(faction.template.infantries);

	if (infantryName == null) {
		throw "infantry not found";
	}

	const infantry: DcsJs.CampaignUnit = {
		id: "",
		name: infantryName,
		displayName: infantryName,
		alive: true,
		category: "Infantry",
		state: "idle",
		vehicleTypes: ["Infantry"],
	};

	const shoradVehicleName = firstItem(faction.template.shoradVehicles);

	const shoradVehicle: DcsJs.CampaignUnit | undefined =
		shoradVehicleName == null
			? undefined
			: {
					id: "",
					name: shoradVehicleName,
					displayName: shoradVehicleName,
					alive: true,
					category: "Air Defence",
					state: "idle",
					vehicleTypes: ["SHORAD"],
			  };

	const shoradInfantryName = firstItem(faction.template.shoradInfantries);

	const shoradInfantry: DcsJs.CampaignUnit | undefined =
	shoradInfantryName == null
			? undefined
			: {
					id: "",
					name: shoradInfantryName,
					displayName: shoradInfantryName,
					alive: true,
					category: "Air Defence",
					state: "idle",
					vehicleTypes: ["SHORAD", "Infantry"],
						};

	const groundUnits: Record<string, DcsJs.CampaignUnit> = {};

	Array.from({ length: 40 }, () => {
		const id = createUniqueId();

		groundUnits[id] = {
			...vehicle,
			id,
			displayName: `${vehicle.name}|${id}`,
		};
	});

	Array.from({ length: 40 }, () => {
		const id = createUniqueId();

		groundUnits[id] = {
			...infantry,
			id,
			displayName: `${infantry.name}|${id}`,
		};
	});

	if (shoradVehicle != null) {
		Array.from({ length: 30 }, () => {
			const id = createUniqueId();

			groundUnits[id] = {
				...shoradVehicle,
				id,
				displayName: `${shoradVehicle.name}|${id}`,
			};
		});
	}

	if (shoradInfantry != null) {
		Array.from({ length: 30 }, () => {
			const id = createUniqueId();

			groundUnits[id] = {
				...shoradInfantry,
				id,
				displayName: `${shoradInfantry.name}|${id}`,
			};
		});
	}

	scenario[coalition === "blue" ? "blue" : "red"].ewNames.forEach(() => {
		const name = randomItem(faction.template.ews);

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
