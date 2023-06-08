import type * as DcsJs from "@foxdelta2/dcsjs";

export function clearPackages(faction: DcsJs.CampaignFaction) {
	faction.packages = [];

	Object.values(faction.inventory.aircrafts).forEach((ac) => {
		switch (ac.state) {
			case "idle":
				return;
			default: {
				const inventoryAc = faction.inventory.aircrafts[ac.id];

				if (inventoryAc == null) {
					return;
				}

				inventoryAc.state = "idle";
				inventoryAc.maintenanceEndTime = undefined;
				inventoryAc.a2AWeaponReadyTimer = undefined;
				inventoryAc.a2GWeaponReadyTimer = undefined;
			}
		}
	});
}
