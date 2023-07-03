import * as desertThunder from "./desert-thunder.json";
import * as redBullet from "./red-bullet.json";
import * as roadToParis from "./road-to-paris.json";

export type StructurePlan = {
	structureName: string;
	structureType: string;
};
export type ObjectivePlan = {
	objectiveName: string;
	structures: Array<StructurePlan>;
	groundUnitTypes: Array<string>;
};
export type ScenarioCoalition = {
	airdromeNames: Array<string>;
	carrierObjective?: string;
	objectivePlans: Array<ObjectivePlan>;
};
export type Scenario = {
	map: string;
	id: string;
	available: boolean;
	name: string;
	era: string;
	date: string;
	"win-condition":
		| {
				type: "ground units";
		  }
		| {
				type: "objective";
				value: string;
		  };
	blue: ScenarioCoalition;
	red: ScenarioCoalition;
};

export const scenarioList: Array<Scenario> = [
	redBullet as Scenario,
	roadToParis as Scenario,
	desertThunder as Scenario,
];
