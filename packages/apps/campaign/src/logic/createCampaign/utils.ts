import type * as DcsJs from "@foxdelta2/dcsjs";

import { ObjectivePlan, ScenarioCoalition } from "../../data";

export type DynamicObjectivePlan = ObjectivePlan & { objective: DcsJs.Import.Objective };

export const claimsObjective = (coalition: ScenarioCoalition, objectiveName: string) => {
	if (coalition.objectivePlans.some((plan) => objectiveName.toLowerCase() === plan.objectiveName.toLowerCase())) {
		return true;
	}

	return false;
};
