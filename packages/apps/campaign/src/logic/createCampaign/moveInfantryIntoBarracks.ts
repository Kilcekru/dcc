import { CampaignFaction } from "@foxdelta2/dcsjs";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";

function moveInfantryIntoBarracksForFaction(faction: CampaignFaction) {
	const barracksCount = Object.entries(faction.barracks).length;
	const idleInfantry = Object.values(faction.inventory.groundUnits).filter(
		(unit) => unit.vehicleTypes.some((vt) => vt === "Infantry") && unit.state === "idle"
	);
	const perBarrack = Math.ceil(idleInfantry.length / barracksCount);

	Object.entries(faction.barracks).forEach(([id], i) => {
		const start = i * perBarrack;
		const end = start + perBarrack;

		const barrack = faction.barracks[id];

		if (barrack == null) {
			throw "Barrack not found";
		}

		barrack.unitIds = idleInfantry.slice(start, end).map((unit) => unit.id);
	});
}

export function moveInfantryIntoBarracks(state: CampaignState) {
	if (state.blueFaction == null || state.redFaction == null) {
		return;
	}

	moveInfantryIntoBarracksForFaction(state.blueFaction);
	moveInfantryIntoBarracksForFaction(state.redFaction);
}
