import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createSignal, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { getFlightGroups, sortAsc } from "../../../../utils";
import { FlightGroupItem } from "./FlightGroupItem";
import Styles from "./Sidebar.module.less";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);
	const [selectedFaction] = createSignal<DcsJs.CampaignFaction | undefined>(state.blueFaction);
	const [selectedListType] = createSignal<"flightGroups" | "aircrafts">("flightGroups");

	return (
		<div class={Styles.sidebar}>
			{/* <div style={{ display: "block" }}>
				<Components.Button onPress={() => setSelectedFaction(state.blueFaction)}>Blue</Components.Button>
				<Components.Button onPress={() => setSelectedFaction(state.redFaction)}>Red</Components.Button>
				<Components.Button onPress={() => setSelectedListType("flightGroups")}>Flight Groups</Components.Button>
				<Components.Button onPress={() => setSelectedListType("aircrafts")}>Aircrafts</Components.Button>
	</div> */}
			<h3 class={Styles.sidebar__title}>Flight Groups</h3>
			<Show when={selectedListType() === "flightGroups"}>
				<Components.ScrollContainer>
					<Components.List class={Styles.sidebar__list}>
						<For
							each={getFlightGroups(selectedFaction()?.packages ?? []).sort((a, b) =>
								sortAsc(a, b, (o) => o.startTime)
							)}
						>
							{(fg) => <FlightGroupItem flightGroup={fg} faction={selectedFaction()} />}
						</For>
					</Components.List>
				</Components.ScrollContainer>
			</Show>
		</div>
	);
};
