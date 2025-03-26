import * as Types from "@kilcekru/dcc-shared-types";

import * as eagleDown from "./eagle-down.json";
import * as northernShield from "./northern-shield.json";
import * as redBullet from "./red-bullet.json";

export const scenarioList: Array<Types.Campaign.Scenario> = [
	Types.Campaign.Schema.scenario.parse(northernShield),
	Types.Campaign.Schema.scenario.parse(redBullet),
	Types.Campaign.Schema.scenario.parse(eagleDown),
];
