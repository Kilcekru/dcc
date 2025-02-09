import * as DcsJs from "@foxdelta2/dcsjs";

import { deploymentScoreUpdate } from "./deploymentScoreUpdate";
import { groundGroup } from "./groundGroups";
import { packages } from "./packages";
import { repairSAMs } from "./repairSAMs";

export function spawnSystem(coalition: DcsJs.Coalition) {
	packages(coalition);
	deploymentScoreUpdate(coalition);
	groundGroup(coalition);
	repairSAMs(coalition);
}
