import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { FlightGroupItem } from "./FlightGroupItem";
import Styles from "./Sidebar.module.less";

export const Sidebar = () => {
	const [state, { skipToNextDay }] = useContext(CampaignContext);

	const sortedFlightGroups = createMemo(() => {
		return Array.from(state.flightGroups).sort((a, b) => a.startTime - b.startTime);
	});

	const date = createMemo(() => {
		const d = Utils.DateTime.timerToDate(state.time);

		return d;
	});

	const isNight = createMemo(() => {
		const theatre = DcsJs.Theatres[state.theatre];

		const hour = date().getUTCHours();

		return hour < theatre.info.night.endHour || hour >= theatre.info.night.startHour;
	});

	return (
		<div class={Styles.sidebar}>
			<Show when={isNight() && !state.campaignParams.nightMissions}>
				<div class={Styles["night-wrapper"]}>
					<p class={Styles["night-description"]}>No flight groups are planned during the night.</p>
					<div class={Styles["night-buttons"]}>
						<Components.Button onPress={() => skipToNextDay?.()}>Jump to Day {date().getDate() + 1}</Components.Button>
					</div>
				</div>
			</Show>
			<h3 class={Styles.sidebar__title}>Flight Groups</h3>
			<Components.ScrollContainer>
				<Components.List class={Styles.sidebar__list}>
					<For each={sortedFlightGroups()}>{(fg) => <FlightGroupItem flightGroup={fg} />}</For>
				</Components.List>
			</Components.ScrollContainer>
		</div>
	);
};
