import type * as DcsJs from "@foxdelta2/dcsjs";

export function timerToDate(value: number) {
	const d = new Date(value * 1000);

	return d;
}

export const headingToPosition = (position1: DcsJs.Position, position2: DcsJs.Position) => {
	return (Math.atan2(position2.y - position1.y, position2.x - position1.x) * 180) / Math.PI;
};

export const distanceToPosition = (position1: DcsJs.Position, position2: DcsJs.Position) => {
	return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
};

export const radiansToDegrees = (value: number) => {
	const degrees = value * (180 / Math.PI);
	return (degrees + 360) % 360;
};

export const positiveDegrees = (value: number) => {
	return (value + 360) % 360;
};

export function metersToNauticalMiles(meters: number): number {
	const nauticalMilesInOneMeter = 0.000539957; // 1 meter is approximately 0.000539957 nautical miles
	return meters * nauticalMilesInOneMeter;
}

export function metersPerSecondToKnots(metersPerSecond: number): number {
	const knotsConversionFactor = 1.94384; // 1 meter per second is approximately 1.94384 knots
	return metersPerSecond * knotsConversionFactor;
}
