import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createSignal, For, Match, Switch } from "solid-js";

import { factionList } from "../../../data";
import Styles from "./Faction.module.less";

const playableFactionList = factionList.filter((faction) => faction.playable);

const Faction = (props: { faction: DcsJs.FactionDefinition; onPress: (name: string) => void }) => {
	const flagCountry = () => {
		switch (props.faction.countryName) {
			case "USA":
				return Styles.usa;
			case "France":
				return Styles.france;
			case "Russia":
				return Styles.russia;
			case "Spain":
				return Styles.spain;
			default:
				return;
		}
	};

	return (
		<Components.ListItem onPress={() => props.onPress(props.faction.name)} class={Styles.item}>
			<Components.Card class={Styles.faction}>
				<div class={cnb(Styles.flag, flagCountry())} />
				<h2 class={Styles.name}>{props.faction.name}</h2>
				<h3 class={Styles.year}>{props.faction.year}</h3>
			</Components.Card>
		</Components.ListItem>
	);
};
export const Factions = (props: { next: (blueId: string, redId: string) => void; prev: () => void }) => {
	const [blueFactionName, setBlueFactionName] = createSignal<string | undefined>(undefined);

	return (
		<Switch fallback={<div>Not Found</div>}>
			<Match when={blueFactionName() == null}>
				<div>
					<Components.Button large unstyled class={Styles["back-button"]} onPress={() => props.prev()}>
						<Components.Icons.ArrowBack />
					</Components.Button>
					<h1 class={Styles.title}>Select your Faction</h1>
					<Components.List>
						<For each={playableFactionList} fallback={<div>Loading...</div>}>
							{(faction) => <Faction faction={faction} onPress={setBlueFactionName} />}
						</For>
					</Components.List>
				</div>
			</Match>
			<Match when={blueFactionName() != null}>
				<div>
					<Components.Button large unstyled class={Styles["back-button"]} onPress={() => setBlueFactionName(undefined)}>
						<Components.Icons.ArrowBack />
					</Components.Button>
					<h1 class={Styles.title}>Select the enemy Faction</h1>
					<Components.List>
						<For each={factionList} fallback={<div>Loading...</div>}>
							{(faction) => (
								<Faction faction={faction} onPress={() => props.next(blueFactionName() ?? "", faction.name)} />
							)}
						</For>
					</Components.List>
				</div>
			</Match>
		</Switch>
	);
};
