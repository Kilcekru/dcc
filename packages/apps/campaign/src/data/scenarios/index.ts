import * as desertThunder from "./desert-thunder.json";
import * as redBullet from "./red-bullet.json";
import * as roadToParis from "./road-to-paris.json";
export type ScenarioCoalition = {
	airdromeNames: Array<string>;
	objectiveNames: Array<string>;
	samNames: Array<string>;
	ewNames: Array<string>;
	barracks: Array<string>;
	depots: Array<string>;
	ammoDepots: Array<string>;
	farps: Array<string>;
};
export type Scenario = {
	map: string;
	id: string;
	available: boolean;
	name: string;
	era: string;
	date: string;
	blue: ScenarioCoalition;
	red: ScenarioCoalition;
};

export const scenarioList: Array<Scenario> = [redBullet, roadToParis, desertThunder];
