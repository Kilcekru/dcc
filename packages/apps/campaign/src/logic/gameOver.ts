import { RunningCampaignState } from "./types";

export const gameOver = (state: RunningCampaignState) => {
	const hasBlueUnitsAlive = Object.values(state.blueFaction.inventory.groundUnits).some(
		(unit) => unit.alive && unit.state !== "idle" && unit.category != "Air Defence"
	);

	if (!hasBlueUnitsAlive) {
		state.winner = "red";
	}

	switch (state.winningCondition.type) {
		case "ground units": {
			const hasRedUnitsAlive = Object.values(state.redFaction.inventory.groundUnits).some(
				(unit) => unit.alive && unit.state !== "idle" && unit.category != "Air Defence"
			);

			if (!hasRedUnitsAlive) {
				state.winner = "blue";
			}

			break;
		}
		case "objective": {
			if (state.objectives[state.winningCondition.value]?.coalition === "blue") {
				state.winner = "blue";
			}
		}
	}
};
