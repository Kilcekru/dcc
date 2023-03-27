import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createSignal, For, Match, Switch } from "solid-js";

import { factionList } from "../../../data";
import styles from "./Faction.module.less";

const Faction = (props: { faction: DcsJs.FactionDefinition; onPress: (name: string) => void }) => {
	const flagCountry = () => {
		switch (props.faction.countryName) {
			case "USA":
				return styles.usa;
			case "France":
				return styles.france;
			case "Russia":
				return styles.russia;
			case "Spain":
				return styles.spain;
			default:
				return;
		}
	};

	return (
		<Components.ListItem onPress={() => props.onPress(props.faction.name)} class={styles.item}>
			<Components.Card class={styles.faction}>
				<div class={cnb(styles.flag, flagCountry())} />
				<h2 class={styles.name}>{props.faction.name}</h2>
				<h3 class={styles.year}>{props.faction.year}</h3>
			</Components.Card>
		</Components.ListItem>
	);
};
export const Factions = (props: { next: (blueId: string, redId: string) => void }) => {
	const [blueFactionName, setBlueFactionName] = createSignal<string | undefined>(undefined);

	return (
		<Switch fallback={<div>Not Found</div>}>
			<Match when={blueFactionName() == null}>
				<div>
					<h1 class={styles.title}>Select your Faction</h1>
					<Components.List>
						<For each={factionList} fallback={<div>Loading...</div>}>
							{(faction) => <Faction faction={faction} onPress={setBlueFactionName} />}
						</For>
					</Components.List>
				</div>
			</Match>
			<Match when={blueFactionName() != null}>
				<div>
					<h1 class={styles.title}>Select the enemy Faction</h1>
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
