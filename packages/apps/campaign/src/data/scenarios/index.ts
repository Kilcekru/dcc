import { Campaign } from "@kilcekru/dcc-shared-types";

import * as operationNorthernShield from "./operation-northern-shield.json";
import * as redBullet from "./red-bullet.json";
import * as roadToParis from "./road-to-paris.json";

export const scenarioList: Array<Campaign.Scenario> = [
	redBullet as unknown as Campaign.Scenario,
	operationNorthernShield as unknown as Campaign.Scenario,
	roadToParis as unknown as Campaign.Scenario,
];
