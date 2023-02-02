import * as DcsJs from "@foxdelta2/dcsjs";
import { createUniqueId } from "solid-js";

import { firstItem } from "../../utils";

export const generateGroundUnitsInventory = (faction: DcsJs.FactionDefinition) => {
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
		vehicleTypes: [],
	};

	const aaaName = firstItem(faction.template.aaa);

	const aaaVehicle: DcsJs.CampaignUnit | undefined =
		aaaName == null
			? undefined
			: {
					id: "",
					name: aaaName,
					displayName: aaaName,
					alive: true,
					category: "Infantry",
					state: "idle",
					vehicleTypes: [],
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

	if (aaaVehicle != null) {
		Array.from({ length: 20 }, () => {
			const id = createUniqueId();

			groundUnits[id] = {
				...aaaVehicle,
				id,
				displayName: `${aaaVehicle.name}|${id}`,
			};
		});
	}

	return groundUnits;
};
