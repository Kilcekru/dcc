import type * as DcsJs from "@foxdelta2/dcsjs";

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

export const degreesToRadians = (degrees: number) => {
	// return parseFloat(((degrees * Math.PI) / 180).toFixed(2));
	return (degrees / 360) * 2 * Math.PI;
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

export const findInside = <T>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
	radius: number,
): Array<T> => {
	return (
		values?.filter((v) => {
			const position = positionSelector(v);

			const diffX = sourcePosition.x - position.x;
			const diffY = sourcePosition.y - position.y;

			if (diffX >= -radius && diffX <= radius && diffY >= -radius && diffY <= radius) {
				return true; // distanceToPosition(sourcePosition, position) <= radius;
			} else {
				return false;
			}
		}) ?? []
	);
};

export const someInside = <T extends DcsJs.Position | { position: DcsJs.Position }>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	radius: number,
) => {
	return (
		values?.some((v) => {
			const position = objectToPosition(v);

			const diffX = sourcePosition.x - position.x;
			const diffY = sourcePosition.y - position.y;

			if (diffX >= -radius && diffX <= radius && diffY >= -radius && diffY <= radius) {
				return true; // distanceToPosition(sourcePosition, position) <= radius;
			} else {
				return false;
			}
		}) ?? false
	);
};

export const findNearest = <T>(
	values: Array<T> | Set<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
) => {
	if (values == null) {
		return;
	}

	let selected: T | undefined = undefined;
	let selectedDistance = 10000000;

	for (const value of values) {
		const position = positionSelector(value);
		const distance = distanceToPosition(sourcePosition, position);

		if (distance < selectedDistance) {
			selected = value;
			selectedDistance = distance;
		}
	}

	return selected;
};

export const findFarthest = <T>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
) => {
	return values?.reduce(
		([prevObj, prevDistance], v) => {
			const position = positionSelector(v);
			const distance = distanceToPosition(sourcePosition, position);

			if (distance > prevDistance) {
				return [v, distance] as [T, number];
			} else {
				return [prevObj, prevDistance] as [T, number];
			}
		},
		[undefined, 0] as [T, number],
	)[0];
};

const isPosition = (value: DcsJs.Position | { position: DcsJs.Position }): value is DcsJs.Position => {
	return (value as DcsJs.Position).x != null;
};
export const objectToPosition = <T extends DcsJs.Position | { position: DcsJs.Position }>(value: T): DcsJs.Position => {
	if (isPosition(value)) {
		return {
			x: value.x,
			y: value.y,
		};
	} else {
		return value.position;
	}
};

export const positionFromHeading = (pos: DcsJs.Position, heading: number, distance: number): DcsJs.Position => {
	let positiveHeading = heading;
	while (positiveHeading < 0) {
		positiveHeading += 360;
	}

	positiveHeading %= 360;

	const radHeading = degreesToRadians(positiveHeading);

	return {
		x: pos.x + Math.cos(radHeading) * distance,
		y: pos.y + Math.sin(radHeading) * distance,
	};
};

export const addHeading = (heading: number, value: number) => {
	let sum = heading + value;

	while (sum < 0) {
		sum += 360;
	}

	return sum % 360;
};
