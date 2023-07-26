import { randomItem } from "../utils";

export const getUsableUnit = <T>(units: Array<T>, typeParam: keyof T, count: number) => {
	const usableUnitTypes = units.filter((ac) => {
		const acCount = units.filter((a) => a[typeParam] === ac[typeParam]).length;

		return acCount >= count;
	});

	const randomAircraft = randomItem(usableUnitTypes);

	return usableUnitTypes.filter((ac) => ac[typeParam] === randomAircraft?.[typeParam]);
};
