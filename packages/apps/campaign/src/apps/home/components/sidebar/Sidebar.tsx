import * as Components from "@kilcekru/dcc-lib-components";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { Config } from "../../../../data";
import { getFlightGroups, sortDesc, timerToDate } from "../../../../utils";
import { FlightGroupItem } from "./FlightGroupItem";
import Styles from "./Sidebar.module.less";

export const Sidebar = () => {
	const [state, { skipToNextDay }] = useContext(CampaignContext);

	const date = createMemo(() => {
		const d = timerToDate(state.timer);

		return d;
	});

	const isNight = createMemo(() => {
		const hour = date().getUTCHours();

		return hour < Config.night.endHour || hour >= Config.night.startHour;
	});

	return (
		<div class={Styles.sidebar}>
			<Show when={isNight() && !state.allowNightMissions}>
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
					<For
						each={getFlightGroups(state.blueFaction?.packages ?? []).sort((a, b) => sortDesc(a, b, (o) => o.startTime))}
					>
						{(fg) => <FlightGroupItem flightGroup={fg} faction={state.blueFaction} />}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</div>
	);
};
