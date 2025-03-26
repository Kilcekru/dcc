import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";

import { factionList as predefinedFactions } from "../data/factions";

export function predefinedFactionList() {
	return predefinedFactions;
}

export async function customFactionList() {
	// eslint-disable-next-line no-console
	return await rpc.campaign.loadFactions();
}

export async function factionList() {
	const custom = await customFactionList();
	const predefined = predefinedFactionList();

	if (custom == null) {
		return predefined;
	}

	return [...custom, ...predefined];
}
