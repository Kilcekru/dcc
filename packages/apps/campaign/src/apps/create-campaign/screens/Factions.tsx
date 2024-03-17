import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { cnb } from "cnbuilder";
import { createMemo, For, Match, Show, Switch } from "solid-js";

import { AircraftLabel } from "../../../components/aircraft-label/AircraftLabel";
import { useCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./Factions.module.less";
import { useFactions } from "./utils";

function isCustomFaction(faction: Types.Campaign.Faction) {
	return faction.created != null;
}

const Faction = (props: {
	faction: Types.Campaign.Faction;
	onPress: (faction: Types.Campaign.Faction) => void;
	onCustomizeFaction: () => void;
	onDeleteFaction: () => void;
}) => {
	const aircraftTypes = createMemo(() => {
		const aircraftTypes: Array<DcsJs.AircraftType> = [];

		Object.values(props.faction.aircraftTypes).forEach((taskAircrafts) => {
			taskAircrafts.forEach((at) => {
				if (!aircraftTypes.some((t) => t === at)) {
					aircraftTypes.push(at);
				}
			});
		});

		return aircraftTypes;
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
				<Show when={isCustomFaction(props.faction)}>
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
export const Factions = () => {
	const { factions, onDelete } = useFactions();
	const store = useCreateCampaignStore();
	const playableFactions = createMemo(() => factions().filter((faction) => faction.playable === true));
	const enemyFactions = createMemo(() =>
		factions().filter((faction) => faction.countryName !== store.faction?.countryName),
	);
	const sortedList = createMemo(() => {
		const list = store.currentScreen === "Faction" ? playableFactions() : enemyFactions();

		const custom: Array<Types.Campaign.Faction> = [];
		const predefined: Array<Types.Campaign.Faction> = [];

		list.forEach((f) => (f.created == null ? predefined.push(f) : custom.push(f)));
		custom.sort((a, b) => Utils.Sort.Number.desc(a.year ?? 0, b.year ?? 0));
		predefined.sort((a, b) => Utils.Sort.Number.desc(a.year ?? 0, b.year ?? 0));

		return [...custom, ...predefined];
	});

	function onNext(faction: Types.Campaign.Faction) {
		if (store.currentScreen === "Faction") {
			store.currentScreen = "Enemy Faction";
			store.faction = faction;
		} else {
			store.currentScreen = "Settings";
		}
	}

	function onPrev() {
		if (store.currentScreen === "Faction") {
			store.currentScreen = "Description";
		} else {
			store.currentScreen = "Faction";
		}
	}

	function onCustomFaction(faction?: Types.Campaign.Faction) {
		store.prevScreen = store.currentScreen;
		store.currentScreen = "Custom Faction";

		if (faction == null) {
			store.faction = undefined;
		} else {
			store.faction = faction;
		}
	}

	return (
		<div class={Styles.wrapper}>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={onPrev}>
				<Components.Icons.ArrowBack />
			</Components.Button>
			<Switch fallback={<div>Not Found</div>}>
				<Match when={store.currentScreen === "Faction"}>
					<h1 class={Styles.title}>Select your Faction</h1>
				</Match>
				<Match when={store.currentScreen !== "Faction"}>
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
								onCustomizeFaction={() => onCustomFaction(faction)}
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
