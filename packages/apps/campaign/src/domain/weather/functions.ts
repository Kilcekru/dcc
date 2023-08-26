import * as Types from "@kilcekru/dcc-shared-types";

import { mapRange, random, round } from "../utils";

export function getTemperature(
	timer: number,
	temperatureOffset: number,
	cloudCover: number,
	dataStore: Types.Campaign.DataStore,
) {
	const hours = timer / 60 / 60;
	const temperatureAmplitude = dataStore.mapInfo?.weather.temperature.amplitude ?? 10; // Amplitude of temperature variation
	const temperatureMean = dataStore.mapInfo?.weather.temperature.mean ?? 25; // Mean temperature for the day
	const period = 24; // Number of hours in a day
	const hoursOffset = 15;

	const angle = ((hours + hoursOffset) / period) * 2 * Math.PI; // Calculate the angle based on the time
	const temperature = temperatureMean + temperatureAmplitude * Math.sin(angle) + temperatureOffset - cloudCover * 10;

	return Math.round(temperature);
}

export function generateCloudCover(baseCloudCover: number, seasonalEffect: number) {
	const maxHourlyIncrease = 0.2; // Max increase due to time of day
	const days = 10;

	const period = 24 * days; // Number of hours in the entire period

	const cloudCoverData: number[] = [];

	for (let hour = 0; hour < period; hour++) {
		const timeOfDayFactor = 1 + maxHourlyIncrease * Math.cos(((hour + 12) / period) * 2 * Math.PI);

		const randomNoise = Math.random() * 0.5 - 0.25; // Adjusted random noise

		let cloudCover = baseCloudCover * timeOfDayFactor * (1 + seasonalEffect) + randomNoise;

		// Ensure cloudCover is within [0, 1] range
		cloudCover = Math.max(0, Math.min(1, cloudCover));

		cloudCoverData.push(round(cloudCover, 3));
	}

	return cloudCoverData;
}

export function getCloudCover(timer: number, cloudCoverData: Array<number>, allowBadWeather: boolean) {
	const hours = round(timer / 60 / 60, 0);

	const i = hours % cloudCoverData.length;

	const cover = cloudCoverData[i] ?? 0;

	return allowBadWeather ? cover : mapRange(cover, 0, 1, 0, 0.6);
}

export function getWind(cloudCover: number, dataStore: Types.Campaign.DataStore) {
	const speed = Math.max(1, (dataStore.mapInfo?.weather.wind.speed ?? 0) + cloudCover * 5);
	const direction = (dataStore.mapInfo?.weather.wind.direction ?? 0) + random(-20, 20);

	return {
		speed,
		direction,
	};
}

export function getCurrentWeather(
	timer: number,
	temperatureOffset: number,
	cloudCoverData: Array<number>,
	allowBadWeather: boolean,
	dataStore: Types.Campaign.DataStore,
) {
	const cloudCover = getCloudCover(timer, cloudCoverData, allowBadWeather);
	const temperature = getTemperature(timer, temperatureOffset, cloudCover, dataStore);
	const wind = getWind(cloudCover, dataStore);

	return {
		cloudCover,
		temperature,
		wind,
	};
}

export function getCloudPreset(cloudCover: number) {
	if (cloudCover <= 15) {
		return "Clear";
	} else if (cloudCover <= 35) {
		return "Scattered";
	} else if (cloudCover <= 60) {
		return "Overcast";
	} else {
		return "Rain";
	}
}
