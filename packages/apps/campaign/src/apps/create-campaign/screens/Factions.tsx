import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { For, Match, Switch } from "solid-js";

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
export const Factions = (props: {
	coalition: DcsJs.CampaignCoalition;
	next: (faction: DcsJs.FactionDefinition) => void;
	customFaction: (template?: DcsJs.FactionDefinition) => void;
	prev: () => void;
}) => {
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
					<For each={playableFactionList} fallback={<div>Loading...</div>}>
						{(faction) => (
							<Faction
								faction={faction}
								onPress={() => {
									props.next(faction);
								}}
							/>
						)}
					</For>
				</Components.List>
			</div>

			<Components.Button large onPress={() => props.customFaction()}>
				Create
			</Components.Button>
		</div>
	);
};
