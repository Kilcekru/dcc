import { Random } from "..";

export const getUsableUnit = <T>(units: Array<T>, typeParam: keyof T, count: number) => {
	const usableUnitTypes = units.filter((ac) => {
		const acCount = units.filter((a) => a[typeParam] === ac[typeParam]).length;

		return acCount >= count;
	});

	const randomAircraft = Random.item(usableUnitTypes);

	return usableUnitTypes.filter((ac) => ac[typeParam] === randomAircraft?.[typeParam]);
};
