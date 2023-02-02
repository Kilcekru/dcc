import "./Sidebar.less";

import * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, For, Show, useContext } from "solid-js";

import { Button, CampaignContext, List, ListItem } from "../../../../components";
import { getFlightGroups, sortAsc } from "../../../../utils";
import { AircraftItem } from "./AircraftItem";
import { FlightGroupItem } from "./FlightGroupItem";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);
	const [selectedFaction, setSelectedFaction] = createSignal<DcsJs.CampaignFaction | undefined>(state.blueFaction);
	const [selectedListType, setSelectedListType] = createSignal<"flightGroups" | "aircrafts">("flightGroups");

	return (
		<div class="sidebar">
			<Button onPress={() => setSelectedFaction(state.blueFaction)}>Blue</Button>
			<Button onPress={() => setSelectedFaction(state.redFaction)}>Red</Button>
			<Button onPress={() => setSelectedListType("flightGroups")}>Flight Groups</Button>
			<Button onPress={() => setSelectedListType("aircrafts")}>Aircrafts</Button>
			<Show when={selectedListType() === "flightGroups"}>
				<List>
					<ListItem class="sidebar__header">
						<div>Task</div>
						<div>Name</div>
						<div>Start</div>
						<div>TOT</div>
						<div>Duration</div>
					</ListItem>

					<For
						each={getFlightGroups(selectedFaction()?.packages ?? []).sort((a, b) => sortAsc(a, b, (o) => o.startTime))}
					>
						{(fg) => <FlightGroupItem flightGroup={fg} />}
					</For>
				</List>
			</Show>
			<Show when={selectedListType() === "aircrafts"}>
				<List>
					<ListItem class="sidebar__header">
						<div>Task</div>
						<div>Name</div>
						<div>Start</div>
						<div>TOT</div>
						<div>Duration</div>
					</ListItem>

					<For each={selectedFaction()?.inventory.aircrafts}>
						{(ac) => <AircraftItem aircraft={ac} faction={selectedFaction()} />}
					</For>
				</List>
			</Show>
		</div>
	);
};
