import * as redBullet from "./redBullet.json";

export type Scenario = {
	map: string;
	name: string;
	date: string;
	blue: {
		airdromeNames: Array<string>;
		farpNames: Array<string>;
		objectiveNames: Array<string>;
		samNames: Array<string>;
		ewNames: Array<string>;
	};
	red: {
		airdromeNames: Array<string>;
		farpNames: Array<string>;
		objectiveNames: Array<string>;
		samNames: Array<string>;
		ewNames: Array<string>;
	};
};

export const scenarioList: Array<Scenario> = [redBullet];
