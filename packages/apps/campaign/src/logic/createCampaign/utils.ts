import { ScenarioCoalition } from "../../data";

export const claimsObjective = (coalition: ScenarioCoalition, objectiveName: string) => {
	if (coalition.objectiveNames.some((name) => objectiveName.toLowerCase() === name.toLowerCase())) {
		return true;
	}

	if (coalition.ammoDepots.some((name) => name.toLowerCase().indexOf(objectiveName.toLowerCase()) >= 0)) {
		return true;
	}

	if (coalition.depots.some((name) => name.toLowerCase().indexOf(objectiveName.toLowerCase()) >= 0)) {
		return true;
	}

	if (coalition.barracks.some((name) => name.toLowerCase().indexOf(objectiveName.toLowerCase()) >= 0)) {
		return true;
	}
	return false;
};
