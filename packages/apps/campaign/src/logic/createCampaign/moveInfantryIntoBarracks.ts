import type * as DcsJs from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

import { isCampaignStructureUnitCamp } from "../utils";

function moveInfantryIntoBarracksForFaction(faction: DcsJs.CampaignFaction) {
	const barracks = Object.values(faction.structures).filter((structure) => structure.structureType === "Barrack");
	const barracksCount = Object.entries(barracks).length;
	const idleInfantry = Object.values(faction.inventory.groundUnits).filter(
		(unit) => unit.vehicleTypes.some((vt) => vt === "Infantry") && unit.state === "idle"
	);
	const perBarrack = Math.ceil(idleInfantry.length / barracksCount);

	barracks.forEach((barrack, i) => {
		const start = i * perBarrack;
		const end = start + perBarrack;

		const structure = faction.structures[barrack.name];

		if (structure == null) {
			throw "Barrack not found";
		}

		if (isCampaignStructureUnitCamp(structure)) {
			structure.unitIds = idleInfantry.slice(start, end).map((unit) => unit.id);
		}
	});
}

export function moveInfantryIntoBarracks(state: CampaignState) {
	if (state.blueFaction == null || state.redFaction == null) {
		return;
	}

	moveInfantryIntoBarracksForFaction(state.blueFaction);
	moveInfantryIntoBarracksForFaction(state.redFaction);
}
