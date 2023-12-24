import * as DcsJs from "@foxdelta2/dcsjs";
import * as Utils from "@kilcekru/dcc-shared-utils";

import * as Entities from "../entities";
import { store } from "../store";

export function nearestOppAirdrome(coalition: DcsJs.Coalition, position: DcsJs.Position) {
	const oppCoalition = Utils.Coalition.opposite(coalition);

	let selectedAirdrome: Entities.Airdrome | undefined = undefined;
	let distanceToSelected = Infinity;

	for (const airdrome of store.queries.airdromes[oppCoalition]) {
		const distance = Utils.Location.distanceToPosition(position, airdrome.position);

		if (distance < distanceToSelected) {
			distanceToSelected = distance;
			selectedAirdrome = airdrome;
		}
	}

	return selectedAirdrome;
}
