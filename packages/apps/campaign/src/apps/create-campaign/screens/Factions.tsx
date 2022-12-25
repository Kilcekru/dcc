import { For } from "solid-js";

import { List, ListItem } from "../../../components";

const factionList = [
	{
		id: "1",
		name: "USA",
	},
	{
		id: "2",
		name: "Sweden",
	},
];

export const Factions = (props: { next: (factionId: string) => void }) => {
	return (
		<div>
			<h2>Select your Faction(blue)</h2>
			<List>
				<For each={factionList} fallback={<div>Loading...</div>}>
					{(faction) => (
						<ListItem onPress={() => props.next(faction.id)}>
							<h3>{faction.name}</h3>
						</ListItem>
					)}
				</For>
			</List>
		</div>
	);
};
