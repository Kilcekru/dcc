import "./Sidebar.less";

import * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, For, useContext } from "solid-js";

import { Button, CampaignContext, List, ListItem } from "../../../../components";
import { getFlightGroups } from "../../../../utils";
import { FlightGroupItem } from "./FlightGroupItem";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);
	const [selectedFaction, setSelectedFaction] = createSignal<DcsJs.CampaignCoalition>("blue");

	return (
		<div class="sidebar">
			<Button onPress={() => setSelectedFaction("blue")}>Blue</Button>
			<Button onPress={() => setSelectedFaction("red")}>Red</Button>
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
		</div>
	);
};
