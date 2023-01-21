import * as DcsJs from "@foxdelta2/dcsjs";
import { useContext } from "solid-js";

import { CampaignContext } from "./components";
import { DataContext } from "./components/DataProvider";
import { Position } from "./types";
import { findNearest, oppositeCoalition } from "./utils";

export const useFaction = (coalition: DcsJs.CampaignCoalition) => {
	const [state] = useContext(CampaignContext);

	return coalition === "blue" ? state.blueFaction : coalition === "red" ? state.redFaction : undefined;
};

export const useCalcNearestOppositeAirdrome = (coalition: DcsJs.CampaignCoalition) => {
	const oppositeFaction = useFaction(oppositeCoalition(coalition));
	const dataStore = useContext(DataContext);

	if (oppositeFaction == null || dataStore == null) {
		throw "airdrome not found";
	}

	return (position: Position) => {
		const airdromes = oppositeFaction.airdromeNames.map((name) => {
			if (dataStore.airdromes == null) {
				throw "undefined airdromes";
			}
			return dataStore.airdromes?.[name];
		});

		const airdrome = findNearest(airdromes, position, (ad) => ad);

		if (airdrome == null) {
			throw "undefined airdromes";
		}

		return airdrome;
	};
};
