import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { cnb } from "cnbuilder";
import { createMemo, For, Match, Show, Switch } from "solid-js";

import { AircraftLabel } from "../../../components/aircraft-label/AircraftLabel";
import Styles from "./Factions.module.less";
import { useFactions } from "./utils";

function isCustomFaction(faction: Types.Campaign.Faction) {
	return faction.created != null;
}

const Faction = (props: {
	faction: Types.Campaign.Faction;
	onPress: (name: string) => void;
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
		<Components.Card class={Styles.faction} onPress={() => props.onPress(props.faction.name)}>
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
export const Factions = (props: {
	coalition: DcsJs.Coalition;
	blueCountry?: string;
	next: (faction: Types.Campaign.Faction) => void;
	customFaction: (template?: Types.Campaign.Faction) => void;
	prev: () => void;
}) => {
	const { factions, onDelete } = useFactions();
	const playableFactions = createMemo(() => factions().filter((faction) => faction.playable === true));
	const enemyFactions = createMemo(() => factions().filter((faction) => faction.countryName !== props.blueCountry));
	const sortedList = createMemo(() => {
		const list = props.coalition === "blue" ? playableFactions() : enemyFactions();

		const custom: Array<Types.Campaign.Faction> = [];
		const predefined: Array<Types.Campaign.Faction> = [];

		list.forEach((f) => (f.created == null ? predefined.push(f) : custom.push(f)));
		custom.sort((a, b) => Utils.Sort.Number.desc(a.year ?? 0, b.year ?? 0));
		predefined.sort((a, b) => Utils.Sort.Number.desc(a.year ?? 0, b.year ?? 0));

		return [...custom, ...predefined];
	});

	return (
		<div class={Styles.wrapper}>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={() => props.prev()}>
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
								onPress={() => {
									props.next(faction);
								}}
								onCustomizeFaction={() => props.customFaction(faction)}
								onDeleteFaction={() => onDelete(faction)}
							/>
						)}
					</For>
				</div>
			</Components.ScrollContainer>

			<div class={Styles.buttons}>
				<Components.Button large onPress={() => props.customFaction()}>
					Create Custom
				</Components.Button>
			</div>
		</div>
	);
};
