import type * as DcsJs from "@foxdelta2/dcsjs";
import { createMemo, useContext } from "solid-js";

import { RunningCampaignState } from "../logic/types";
import { getCoalitionFaction } from "../logic/utils";
import { CampaignContext } from "./CampaignProvider";

export const useFaction = (coalition: DcsJs.Coalition | undefined) => {
	const [state] = useContext(CampaignContext);
	const faction = createMemo(() => {
		if (coalition == null) {
			return undefined;
		}
		return getCoalitionFaction(coalition, state as RunningCampaignState);
	});

	return faction;
};
