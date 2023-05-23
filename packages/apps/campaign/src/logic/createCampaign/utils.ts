import { ScenarioCoalition } from "../../data";

export const claimsObjective = (coalition: ScenarioCoalition, objectiveName: string) => {
	if (coalition.objectivePlans.some((plan) => objectiveName.toLowerCase() === plan.objectiveName.toLowerCase())) {
		return true;
	}

	return false;
};
