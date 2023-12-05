import * as DcsJs from "@foxdelta2/dcsjs";

import { world } from "../../world";

export function move(worldDelta: number, coalition: DcsJs.Coalition) {
	const groundGroups = world.queries.groundGroups[coalition].get("en route");

	for (const groundGroup of groundGroups) {
		groundGroup.move(worldDelta);
	}
}
