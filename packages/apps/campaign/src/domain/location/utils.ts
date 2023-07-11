import type * as DcsJs from "@foxdelta2/dcsjs";

export const distanceToPosition = (position1: DcsJs.Position, position2: DcsJs.Position) => {
	return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
};

export const findInside = <T>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
	radius: number
): Array<T> => {
	return (
		values?.filter((v) => {
			const position = positionSelector(v);

			return distanceToPosition(sourcePosition, position) <= radius;
		}) ?? []
	);
};

export const findNearest = <T>(
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position
) => {
	return values?.reduce(
		([prevObj, prevDistance], v) => {
			const position = positionSelector(v);
			const distance = distanceToPosition(sourcePosition, position);

			if (distance < prevDistance) {
				return [v, distance] as [T, number];
			} else {
				return [prevObj, prevDistance] as [T, number];
			}
		},
		[undefined, 10000000] as [T, number]
	)[0];
};
