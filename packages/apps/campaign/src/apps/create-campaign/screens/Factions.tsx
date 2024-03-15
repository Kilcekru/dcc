import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, createSignal, For, Match, onMount, Show, Switch } from "solid-js";

import { AircraftLabel } from "../../../components/aircraft-label/AircraftLabel";
import { useDataStore } from "../../../components/DataProvider";
import * as Domain from "../../../domain";
import { useCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./Factions.module.less";

const Faction = (props: {
	faction: DcsJs.Faction;
	onPress: (faction: DcsJs.Faction) => void;
	onCustomizeFaction: () => void;
	onDeleteFaction: () => void;
}) => {
	const dataStore = useDataStore();
	// const updateFactions = Domain.Faction.useUpdate();

	const aircraftTypes = createMemo(() => {
		const aircraftTypes: Array<string> = [];

		Object.values(props.faction.aircraftTypes).forEach((taskAircrafts) => {
			taskAircrafts.forEach((at) => {
				if (!aircraftTypes.some((t) => t === at)) {
					aircraftTypes.push(at);
				}
			});
		});

		const aircrafts = dataStore.aircrafts;

		if (aircrafts == null) {
			return [];
		}

		return aircraftTypes as Array<DcsJs.AircraftType>;
	});

	return (
		<Components.Card class={Styles.faction} onPress={() => props.onPress(props.faction)}>
			<Components.Flag class={cnb(Styles.flag)} countryName={props.faction.countryName} />
			<h2 class={Styles.name}>{props.faction.name}</h2>
			<h3 class={Styles.year}>{props.faction.year}</h3>
			<div class={Styles["aircraft-list"]}>
				<For each={aircraftTypes()}>{(aircraftType) => <AircraftLabel aircraftType={aircraftType} />}</For>
			</div>
			<div class={Styles["customize-button-wrapper"]}>
				<Components.Tooltip text="Customize Faction">
					<Components.Button class={Styles["customize-button"]} unstyled onPress={() => props.onCustomizeFaction()}>
						<Components.Icons.PencilFill />
					</Components.Button>
				</Components.Tooltip>
				<Show when={Domain.Faction.isCustomFaction(props.faction)}>
					<Components.Tooltip text="Remove Faction">
						<Components.Button class={Styles["customize-button"]} unstyled onPress={() => props.onDeleteFaction()}>
							<Components.Icons.TrashFill />
						</Components.Button>
					</Components.Tooltip>
				</Show>
			</div>
		</Components.Card>
	);
};
export const Factions = (props: {
	coalition: DcsJs.Coalition;
	blueCountry?: string;
	next: (faction: DcsJs.Faction) => void;
	customFaction: (template?: DcsJs.Faction) => void;
	prev: () => void;
}) => {
	const store = useCreateCampaignStore();
	const [factions, setFactions] = createSignal<Array<DcsJs.Faction>>([]);
	const playableFactions = createMemo(() => factions().filter((faction) => faction.playable === true));
	const enemyFactions = createMemo(() => factions().filter((faction) => faction.countryName !== props.blueCountry));
	const sortedList = createMemo(() => {
		const list = props.coalition === "blue" ? playableFactions() : enemyFactions();

		const custom: Array<DcsJs.Faction> = [];
		const predefined: Array<DcsJs.Faction> = [];

		list.forEach((f) => (f.created == null ? predefined.push(f) : custom.push(f)));
		custom.sort((a, b) => Domain.Sort.Number.desc(a.year ?? 0, b.year ?? 0));
		predefined.sort((a, b) => Domain.Sort.Number.desc(a.year ?? 0, b.year ?? 0));

		return [...custom, ...predefined];
	});

	onMount(async () => {
		const l = await Domain.Faction.list();

		setFactions(l);
	});

	async function onDelete(faction: DcsJs.Faction) {
		await Domain.Faction.remove(faction);

		const l = await Domain.Faction.list();

		setFactions(l);
	}

	function onNext(faction: DcsJs.Faction) {
		if (store.currentScreen === "Faction") {
			store.currentScreen = "Enemy Faction";
			store.faction = faction;
		} else {
			store.currentScreen = "Faction";
		}
	}

	function onPrev() {
		if (store.currentScreen === "Faction") {
			store.currentScreen = "Description";
		} else {
			store.currentScreen = "Faction";
		}
	}

	function onCustomFaction() {
		store.currentScreen = "Custom Faction";
	}

	return (
		<div class={Styles.wrapper}>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={onPrev}>
				<Components.Icons.ArrowBack />
			</Components.Button>
			<Switch fallback={<div>Not Found</div>}>
				<Match when={props.coalition === "blue"}>
					<h1 class={Styles.title}>Select your Faction</h1>
				</Match>
				<Match when={props.coalition === "red"}>
					<h1 class={Styles.title}>Select the enemy Faction</h1>
				</Match>
			</Switch>
			<Components.ScrollContainer>
				<div class={Styles.list}>
					<For each={sortedList()} fallback={<div>Loading...</div>}>
						{(faction) => (
							<Faction
								faction={faction}
								onPress={onNext}
								onCustomizeFaction={() => props.customFaction(faction)}
								onDeleteFaction={() => onDelete(faction)}
							/>
						)}
					</For>
				</div>
			</Components.ScrollContainer>

			<div class={Styles.buttons}>
				<Components.Button large onPress={onCustomFaction}>
					Create Custom
				</Components.Button>
			</div>
		</div>
	);
};
