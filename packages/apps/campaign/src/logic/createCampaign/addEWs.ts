import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createUniqueId } from "solid-js";

import { Scenario } from "../../data";

const addCoalitionEW = (state: CampaignState, scenario: Scenario, coalition: "blue" | "red") => {
	const faction = state[coalition === "blue" ? "blueFaction" : "redFaction"];

	if (faction == null) {
		return;
	}

	scenario[coalition].objectivePlans.forEach((plan) => {
		const hasEWR = plan.groundUnitTypes.some((gut) => gut === "ewr");

		if (!hasEWR) {
			return;
		}

		const objective = state.objectives[plan.objectiveName];

		if (objective == null) {
			return;
		}

		const unit = Object.values(faction.inventory.groundUnits).find(
			(unit) => unit.vehicleTypes.find((vt) => vt === "EW") && unit.state === "idle"
		);

		if (unit == null) {
			return;
		}

		const inventoryUnit = faction.inventory.groundUnits[unit.id];

		if (inventoryUnit == null) {
			return;
		}

		faction.ews.push({
			id: createUniqueId(),
			objective,
			startObjective: objective,
			position: objective.position,
			state: "on objective",
			unitIds: [unit.id],
			startTime: state.timer,
			groupType: "ew",
		});

		inventoryUnit.state = "on objective";
	});
};
export const addEWs = (state: CampaignState, scenario: Scenario) => {
	addCoalitionEW(state, scenario, "blue");
	addCoalitionEW(state, scenario, "red");
};
