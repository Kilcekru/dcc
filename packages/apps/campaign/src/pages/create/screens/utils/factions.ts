import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import { createSignal, onMount } from "solid-js";

import { factionList } from "../../../../data";

function predefinedList() {
	return factionList;
}

async function customList() {
	return await rpc.campaign.loadFactions();
}

async function list() {
	const custom = await customList();
	const predefined = predefinedList();

	if (custom == null) {
		return predefined;
	}

	return [...custom, ...predefined];
}

async function remove(faction: Types.Campaign.Faction) {
	const custom = await customList();

	const next = custom == null ? [] : custom.filter((c) => c.created !== faction.created);

	await rpc.campaign.saveCustomFactions(next);
}

export function useFactions() {
	const [factions, setFactions] = createSignal<Array<Types.Campaign.Faction>>([]);

	onMount(async () => {
		const l = await list();

		setFactions(l);
	});

	async function onSave(faction: Types.Campaign.Faction) {
		if (faction.created == null) {
			faction.created = new Date();
		}

		const custom = await customList();

		const next = custom == null ? [faction] : [...custom, faction];

		await rpc.campaign.saveCustomFactions(next);

		const l = await list();

		setFactions(l);
	}

	async function onDelete(faction: Types.Campaign.Faction) {
		await remove(faction);

		const l = await list();

		setFactions(l);
	}

	return {
		factions,
		onSave,
		onDelete,
	};
}
