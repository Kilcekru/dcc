import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

export function getTemperature(time: number, temperatureOffset: number, cloudCover: number, theatre: DcsJs.Theatre) {
	const hours = time / 60 / 60;
	const temperatureAmplitude = DcsJs.Theatres[theatre].info.weather.temperature.amplitude ?? 10; // Amplitude of temperature variation
	const temperatureMean = DcsJs.Theatres[theatre].info.weather.temperature.mean ?? 25; // Mean temperature for the day
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

		cloudCoverData.push(Utils.round(cloudCover, 3));
	}

	return cloudCoverData;
}

export function getCloudCover(time: number, cloudCoverData: Array<number>, allowBadWeather: boolean) {
	const hours = Utils.round(time / 60 / 60, 0);

	const i = hours % cloudCoverData.length;

	const cover = cloudCoverData[i] ?? 0;

	return allowBadWeather ? cover : Utils.mapRange(cover, 0, 1, 0, 0.6);
}

export function getWind(cloudCover: number, theatre: DcsJs.Theatre) {
	const speed = Math.max(0.1, (DcsJs.Theatres[theatre].info.weather.wind.speed ?? 0) + cloudCover * 2);
	const direction = (DcsJs.Theatres[theatre].info.weather.wind.direction ?? 0) + Utils.Random.number(-20, 20);

	return {
		speed,
		direction,
	};
}

export function getCurrentWeather(
	time: number,
	temperatureOffset: number,
	cloudCoverData: Array<number>,
	allowBadWeather: boolean,
	theatre: DcsJs.Theatre,
) {
	const cloudCover = getCloudCover(time, cloudCoverData, allowBadWeather);
	const temperature = getTemperature(time, temperatureOffset, cloudCover, theatre);
	const wind = getWind(cloudCover, theatre);

	return {
		cloudCover,
		temperature,
		wind,
	};
}

export function getCloudPreset(cloudCover: number) {
	if (cloudCover <= 0.15) {
		return "Clear";
	} else if (cloudCover <= 0.35) {
		return "Scattered";
	} else if (cloudCover <= 0.6) {
		return "Overcast";
	} else {
		return "Rain";
	}
}
