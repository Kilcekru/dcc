import "./Sidebar.less";

import * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, For, Show, useContext } from "solid-js";

import { Button, CampaignContext, List, ListItem } from "../../../../components";
import { getFlightGroups } from "../../../../utils";
import { AircraftItem } from "./AircraftItem";
import { FlightGroupItem } from "./FlightGroupItem";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);
	const [selectedFaction, setSelectedFaction] = createSignal<DcsJs.CampaignCoalition>("blue");
	const [selectedListType, setSelectedListType] = createSignal<"flightGroups" | "aircrafts">("flightGroups");

	return (
		<div class="sidebar">
			<Button onPress={() => setSelectedFaction("blue")}>Blue</Button>
			<Button onPress={() => setSelectedFaction("red")}>Red</Button>
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
						each={getFlightGroups(
							selectedFaction() === "blue" ? state.blueFaction?.packages : state.redFaction?.packages ?? []
						)}
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

					<For
						each={
							(selectedFaction() === "blue"
								? state.blueFaction?.inventory.aircrafts
								: state.redFaction?.inventory.aircrafts) ?? []
						}
					>
						{(ac) => <AircraftItem aircraft={ac} />}
					</For>
				</List>
			</Show>
		</div>
	);
};
