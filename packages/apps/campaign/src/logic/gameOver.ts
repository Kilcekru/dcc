import { RunningCampaignState } from "./types";

export const gameOver = (state: RunningCampaignState) => {
	const hasRedUnitsAlive = Object.values(state.redFaction.inventory.groundUnits).some(
		(unit) => unit.alive && unit.state !== "idle"
	);

	if (!hasRedUnitsAlive) {
		state.winner = "blue";
	}

	const hasBlueUnitsAlive = Object.values(state.blueFaction.inventory.groundUnits).some(
		(unit) => unit.alive && unit.state !== "idle"
	);

	if (!hasBlueUnitsAlive) {
		state.winner = "red";
	}
};
