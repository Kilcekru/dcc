import * as DcsJs from "@foxdelta2/dcsjs";

import { store } from "../../store";

export function move(worldDelta: number, coalition: DcsJs.Coalition) {
	const groundGroups = store.queries.groundGroups[coalition].get("en route");

	for (const groundGroup of groundGroups) {
		groundGroup.move(worldDelta);
	}
}
