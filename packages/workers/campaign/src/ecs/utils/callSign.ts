import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../entities";
import { world } from "../world";

const calcCallSignNumber = (
	coalition: DcsJs.Coalition,
	base: string,
	index: number,
	number: number,
): { flightGroup: string; unit: { name: string; index: number; number: number } } => {
	const tmp = `${base}-${number}`;

	let callSignFg: Entities.FlightGroup | undefined;

	for (const fg of world.queries.flightGroups[coalition]) {
		if (fg.name === tmp) {
			callSignFg = fg;
			break;
		}
	}

	if (callSignFg == null) {
		return {
			flightGroup: tmp,
			unit: {
				name: base,
				index,
				number,
			},
		};
	}

	return calcCallSignNumber(coalition, base, index, number + 1);
};

export const generateCallSign = (coalition: DcsJs.Coalition, type: "aircraft" | "helicopter" | "awacs") => {
	const ds = world.dataStore;

	if (ds == null) {
		throw new Error("dataStore not initialized");
	}

	const { name, index } = Utils.Random.callSign(ds, type);

	const number = calcCallSignNumber(coalition, name, index, 1);

	return {
		unitCallSign: (index: number) => {
			return {
				"1": number.unit.index,
				"2": number.unit.number,
				"3": index + 1,
				name: `${number.unit.name}${number.unit.number}${index + 1}`,
			};
		},
		unitName: (index: number) => `${number.flightGroup}-${index + 1}`,
		flightGroupName: number.flightGroup,
	};
};