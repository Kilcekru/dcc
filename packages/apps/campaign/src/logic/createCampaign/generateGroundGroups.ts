import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import * as Domain from "../../domain";
import * as Deploy from "../deploy";
import { RunningCampaignState } from "../types";

export function generateGroundGroups(
	objectivePlans: Array<Types.Campaign.DynamicObjectivePlan>,
	coalition: DcsJs.Coalition,
	state: RunningCampaignState,
	dataStore: Types.Campaign.DataStore,
) {
	objectivePlans.forEach((op) => {
		if (op.groundUnitTypes.some((gut) => gut === "vehicles")) {
			const groupType = Domain.Random.number(1, 100) > 40 ? "armor" : "infantry";

			const obj = {
				...op.objective,
				coalition: coalition,
				incomingGroundGroups: {},
			};

			Deploy.groundGroup({
				dataStore,
				groupState: "on objective",
				groupType,
				startObjective: obj,
				state,
				targetObjective: obj,
			});
		}
	});
}
