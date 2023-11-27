import * as DcsJs from "@foxdelta2/dcsjs";

export const hasInside = <T extends DcsJs.Position>(
	values: IterableIterator<T>,
	sourcePosition: DcsJs.Position,
	radius: number,
): boolean => {
	for (const v of values) {
		const diffX = sourcePosition.x - v.x;
		const diffY = sourcePosition.y - v.y;

		if (diffX >= -radius && diffX <= radius && diffY >= -radius && diffY <= radius) {
			return true; // distanceToPosition(sourcePosition, position) <= radius;
		}
	}

	return false;
};
