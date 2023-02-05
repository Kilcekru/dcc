import * as Components from "@kilcekru/dcc-lib-components";
import { createSignal, For, Match, Switch } from "solid-js";

import { factionList } from "../../../data";

export const Factions = (props: { next: (blueId: string, redId: string) => void }) => {
	const [blueFactionName, setBlueFactionName] = createSignal<string | undefined>(undefined);

	return (
		<Switch fallback={<div>Not Found</div>}>
			<Match when={blueFactionName() == null}>
				<div>
					<h2>Select your Faction(blue)</h2>
					<Components.List>
						<For each={factionList} fallback={<div>Loading...</div>}>
							{(faction) => (
								<Components.ListItem onPress={() => setBlueFactionName(faction.name)}>
									<h3>{faction.name}</h3>
								</Components.ListItem>
							)}
						</For>
					</Components.List>
				</div>
			</Match>
			<Match when={blueFactionName() != null}>
				<div>
					<h2>Select the enemy Faction(red)</h2>
					<Components.List>
						<For each={factionList} fallback={<div>Loading...</div>}>
							{(faction) => (
								<Components.ListItem onPress={() => props.next(blueFactionName() ?? "", faction.name)}>
									<h3>{faction.name}</h3>
								</Components.ListItem>
							)}
						</For>
					</Components.List>
				</div>
			</Match>
		</Switch>
	);
};
