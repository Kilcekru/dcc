import * as DcsJs from "@foxdelta2/dcsjs";

import { store } from "../../store";

export function repairSAMs(coalition: DcsJs.Coalition) {
	const samSites = store.queries.SAMs[coalition];

	for (const samSite of samSites) {
		const destroyedUnits = samSite.units.filter((u) => !u.alive);

		if (destroyedUnits.length > 0) {
			samSite.repairTick();
		}
	}
}
