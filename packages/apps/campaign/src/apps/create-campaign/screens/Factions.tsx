import { createSignal, For, Match, Switch } from "solid-js";

import { List, ListItem } from "../../../components";
import { factionList } from "../../../data";

export const Factions = (props: { next: (blueId: string, redId: string) => void }) => {
	const [blueFactionId, setBlueFactionId] = createSignal<string | undefined>(undefined);
	return (
		<Switch fallback={<div>Not Found</div>}>
			<Match when={blueFactionId() == null}>
				<div>
					<h2>Select your Faction(blue)</h2>
					<List>
						<For each={factionList} fallback={<div>Loading...</div>}>
							{(faction) => (
								<ListItem onPress={() => setBlueFactionId(faction.id)}>
									<h3>{faction.name}</h3>
								</ListItem>
							)}
						</For>
					</List>
				</div>
			</Match>
			<Match when={blueFactionId() != null}>
				<div>
					<h2>Select the enemy Faction(red)</h2>
					<List>
						<For each={factionList} fallback={<div>Loading...</div>}>
							{(faction) => (
								<ListItem onPress={() => props.next(blueFactionId() ?? "", faction.id)}>
									<h3>{faction.name}</h3>
								</ListItem>
							)}
						</For>
					</List>
				</div>
			</Match>
		</Switch>
	);
};
