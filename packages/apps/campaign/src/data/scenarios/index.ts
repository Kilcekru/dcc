import * as redBullet from "./redBullet.json";
export type ScenarioCoalition = {
	airdromeNames: Array<string>;
	farpNames: Array<string>;
	objectiveNames: Array<string>;
	samNames: Array<string>;
	ewNames: Array<string>;
	barracks: Array<string>;
	depots: Array<string>;
	ammoDepots: Array<string>;
};
export type Scenario = {
	map: string;
	name: string;
	date: string;
	blue: ScenarioCoalition;
	red: ScenarioCoalition;
};

export const scenarioList: Array<Scenario> = [redBullet];
