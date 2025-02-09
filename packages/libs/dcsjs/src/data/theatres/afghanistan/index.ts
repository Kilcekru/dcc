import { TheatreData } from "../../types";
import { airdromeDefinitions } from "./airdromeDefinitions";
import { objectives } from "./objectives";
import { targets } from "./targets";

export const Afghanistan: TheatreData = {
	objectives,
	targets,
	airdromeDefinitions,
	info: {
		center: {
			y: 614514.51428571,
			x: -325410.47142857,
		},
		weather: {
			temperature: {
				amplitude: 6,
				mean: 25,
			},
			cloudCover: {
				baseCloudCover: 0.3,
				seasonEffect: 0.2,
			},
			wind: {
				speed: 0,
				direction: 300,
			},
		},
		night: {
			startHour: 20,
			endHour: 6,
		},
	},
};
