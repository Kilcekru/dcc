import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, For, Match, Switch } from "solid-js";

import { useDataStore } from "../../../components/DataProvider";
import { factionList } from "../../../data";
import Styles from "./Factions.module.less";

const playableFactionList = factionList.filter((faction) => faction.playable);

const Faction = (props: {
	faction: DcsJs.FactionDefinition;
	onPress: (name: string) => void;
	onCustomizeFaction: () => void;
}) => {
	const dataStore = useDataStore();

	const aircrafts = createMemo(() => {
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

		return aircraftTypes.map((t) => aircrafts[t as DcsJs.AircraftType]?.display_name);
	});

	return (
		<Components.ListItem class={Styles.item}>
			<Components.Card class={Styles.faction} onPress={() => props.onPress(props.faction.name)}>
				<Components.Flag class={cnb(Styles.flag)} countryName={props.faction.countryName} />
				<h2 class={Styles.name}>{props.faction.name}</h2>
				<h3 class={Styles.year}>{props.faction.year}</h3>
				<div class={Styles["aircraft-list"]}>
					<For each={aircrafts()}>{(aircraftName) => <p>{aircraftName}</p>}</For>
				</div>
				<div class={Styles["customize-button-wrapper"]}>
					<Components.Tooltip text="Customize Faction">
						<Components.Button class={Styles["customize-button"]} unstyled onPress={() => props.onCustomizeFaction()}>
							<Components.Icons.PencilFill />
						</Components.Button>
					</Components.Tooltip>
				</div>
			</Components.Card>
		</Components.ListItem>
	);
};
export const Factions = (props: {
	coalition: DcsJs.CampaignCoalition;
	blueCountry?: string;
	next: (faction: DcsJs.FactionDefinition) => void;
	customFaction: (template?: DcsJs.FactionDefinition) => void;
	prev: () => void;
}) => {
	const factions = createMemo(() => factionList.filter((faction) => faction.countryName !== props.blueCountry));

	return (
		<div>
			<div>
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
				<Components.List>
					<For each={props.coalition === "blue" ? playableFactionList : factions()} fallback={<div>Loading...</div>}>
						{(faction) => (
							<Faction
								faction={faction}
								onPress={() => {
									props.next(faction);
								}}
								onCustomizeFaction={() => props.customFaction(faction)}
							/>
						)}
					</For>
				</Components.List>
			</div>

			<div class={Styles.buttons}>
				<Components.Button large onPress={() => props.customFaction()}>
					Create Custom
				</Components.Button>
			</div>
		</div>
	);
};
