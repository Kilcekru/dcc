import * as DcsJs from "@foxdelta2/dcsjs";
import { useContext } from "solid-js";

import { CampaignContext } from "./components";
import { airdromes } from "./data";
import { Position } from "./types";
import { firstItem, headingToPosition, oppositeCoalition } from "./utils";

export const useFaction = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);

	return coalition === "blue" ? state.blueFaction : coalition === "red" ? state.redFaction : undefined;
};

export const useCalcOppositeHeading = (coalition: DcsJs.CampaignCoalition) => {
	const oppositeFaction = useFaction(oppositeCoalition(coalition));

	const oppositeAirdromeName = firstItem(oppositeFaction?.airdromeNames);
	const oppositeAirdrome = airdromes.find((drome) => drome.name === oppositeAirdromeName);

	if (oppositeAirdromeName == null || oppositeAirdrome == null) {
		throw "airdrome not found";
	}

	return (position: Position) => headingToPosition(position, oppositeAirdrome.position);
};
