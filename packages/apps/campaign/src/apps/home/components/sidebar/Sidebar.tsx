import "./Sidebar.less";

import { For, useContext } from "solid-js";

import { CampaignContext, List, ListItem } from "../../../../components";
import { getFlightGroups } from "../../../../utils";
import { FlightGroupItem } from "./FlightGroupItem";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);

	return (
		<div class="sidebar">
			<List>
				<ListItem class="sidebar__header">
					<div>Task</div>
					<div>Name</div>
					<div>Start</div>
					<div>TOT</div>
					<div>Duration</div>
				</ListItem>

				<For each={getFlightGroups(state.blueFaction?.packages ?? [])}>
					{(fg) => <FlightGroupItem flightGroup={fg} />}
				</For>
			</List>
		</div>
	);
};
