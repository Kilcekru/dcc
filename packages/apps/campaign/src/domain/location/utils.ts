import type * as DcsJs from "@foxdelta2/dcsjs";

import { Config } from "../../data";
import { RunningCampaignState } from "../../logic/types";
import { oppositeCoalition } from "../../utils";

export const distanceToPosition = (position1: DcsJs.Position, position2: DcsJs.Position) => {
	return Math.sqrt(Math.pow(position2.x - position1.x, 2) + Math.pow(position2.y - position1.y, 2));
};

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
	values: Array<T> | undefined,
	sourcePosition: DcsJs.Position,
	positionSelector: (value: T) => DcsJs.Position,
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
		[undefined, 10000000] as [T, number],
	)[0];
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

export function InFrontlineRange(
	coalition: DcsJs.CampaignCoalition,
	sourcePosition: DcsJs.Position,
	state: RunningCampaignState,
) {
	const oppCoalition = oppositeCoalition(coalition);
	const oppObjectives = Object.values(state.objectives).filter((obj) => obj.coalition === oppCoalition);

	return someInside(oppObjectives, sourcePosition, Config.structureRange.frontline.barrack);
}
