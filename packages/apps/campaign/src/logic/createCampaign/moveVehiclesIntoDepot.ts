import { CampaignFaction } from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

import { isCampaignStructureUnitCamp } from "../utils";

function moveVehiclesIntoDepotForFaction(faction: CampaignFaction) {
	const depots = Object.values(faction.structures).filter((structure) => structure.structureType === "Depots");
	const depotCount = Object.entries(depots).length;
	const idleVehicles = Object.values(faction.inventory.groundUnits).filter(
		(unit) => unit.vehicleTypes.some((vt) => vt !== "Infantry") && unit.state === "idle"
	);
	const perDepot = Math.ceil(idleVehicles.length / depotCount);

	depots.forEach((depot, i) => {
		const start = i * perDepot;
		const end = start + perDepot;

		const structure = faction.structures[depot.name];

		if (structure == null) {
			throw "depot not found";
		}

		if (isCampaignStructureUnitCamp(structure)) {
			structure.unitIds = idleVehicles.slice(start, end).map((unit) => unit.id);
		}
	});
}

export function moveVehiclesIntoDepot(state: CampaignState) {
	if (state.blueFaction == null || state.redFaction == null) {
		return;
	}

	moveVehiclesIntoDepotForFaction(state.blueFaction);
	moveVehiclesIntoDepotForFaction(state.redFaction);
}
