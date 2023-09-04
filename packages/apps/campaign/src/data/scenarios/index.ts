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
	briefing: string;
	"blue-start-objective-range": [number, number];
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
	redBullet as unknown as Scenario,
	roadToParis as unknown as Scenario,
	desertThunder as unknown as Scenario,
];
