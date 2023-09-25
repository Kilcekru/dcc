import type * as DcsJs from "@foxdelta2/dcsjs";

export function clearPackages(faction: DcsJs.CampaignFaction) {
	faction.packages = [];

	Object.values(faction.inventory.aircrafts).forEach((ac) => {
		switch (ac.state) {
			case "idle":
				return;
			default: {
				resetAircraft(faction, ac.id);
			}
		}
	});
}

/**
 * Removes the package from the faction and resets all affected aircraft states
 *
 * @param faction
 * @param pkg
 */
export function clearPackage(faction: DcsJs.CampaignFaction, pkg: DcsJs.FlightPackage) {
	// Remove the package from the faction
	faction.packages = faction.packages.filter((p) => p.id !== pkg.id);

	// Get all aircraft units within the package
	const aircraftUnits: Array<DcsJs.FlightGroupUnit> = [];

	pkg.flightGroups.forEach((fg) => {
		fg.units.forEach((u) => {
			aircraftUnits.push(u);
		});
	});

	// Reset all aircraft in the package
	aircraftUnits.forEach((unit) => {
		resetAircraft(faction, unit.id);
	});
}

/**
 * Reset the aircraft state in the faction inventory
 *
 * @param faction
 * @param aircraftId
 * @returns
 */
export function resetAircraft(faction: DcsJs.CampaignFaction, aircraftId: string) {
	const inventoryAc = faction.inventory.aircrafts[aircraftId];

	if (inventoryAc == null) {
		return;
	}

	inventoryAc.state = "idle";
	inventoryAc.maintenanceEndTime = undefined;
	inventoryAc.a2AWeaponReadyTimer = undefined;
	inventoryAc.a2GWeaponReadyTimer = undefined;
}
