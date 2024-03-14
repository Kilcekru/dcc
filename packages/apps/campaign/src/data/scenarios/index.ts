import * as Types from "@kilcekru/dcc-shared-types";

import * as eagleDown from "./eagle-down.json";
import * as operationNorthernShield from "./operation-northern-shield.json";
import * as redBullet from "./red-bullet.json";
import * as roadToParis from "./road-to-paris.json";

export const scenarioList: Array<Types.Campaign.Scenario> = [
	Types.Campaign.Schema.scenario.parse(operationNorthernShield),
	Types.Campaign.Schema.scenario.parse(redBullet),
	Types.Campaign.Schema.scenario.parse(roadToParis),
	Types.Campaign.Schema.scenario.parse(eagleDown),
];
