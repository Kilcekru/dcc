import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";

import { factionList } from "../../data";

export function predefinedList() {
	return factionList;
}

export async function customList() {
	// eslint-disable-next-line no-console
	return await rpc.campaign.loadFactions();
}

export async function list() {
	const custom = await customList();
	const predefined = predefinedList();

	if (custom == null) {
		return predefined;
	}

	return [...custom, ...predefined];
}

export async function save(faction: DcsJs.Faction) {
	if (faction.created == null) {
		faction.created = new Date();
	}

	const custom = await customList();

	const next =
		custom == null
			? []
			: custom.map((c) => {
					if (c.created === faction.created) {
						return faction;
					}

					return c;
			  });

	await rpc.campaign.saveCustomFactions(next);
}

export async function remove(faction: DcsJs.Faction) {
	const custom = await customList();

	const next = custom == null ? [] : custom.filter((c) => c.created !== faction.created);

	await rpc.campaign.saveCustomFactions(next);
}
