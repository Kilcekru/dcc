import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, createSignal, For, onCleanup, onMount, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { useDataStore } from "../../../../components/DataProvider";
import { sortDesc, timerToDate } from "../../../../utils";
import { onWorkerEvent } from "../../../../worker";
import { FlightGroupItem } from "./FlightGroupItem";
import Styles from "./Sidebar.module.less";

export const Sidebar = () => {
	const [state, { skipToNextDay }] = useContext(CampaignContext);
	const dataStore = useDataStore();

	let workerSubscription: { dispose: () => void } | undefined;
	const [flightGroups, setFlightGroups] = createSignal<Array<Types.Campaign.FlightGroupItem>>([]);

	onMount(() => {
		workerSubscription = onWorkerEvent(
			"blueFlightGroupsUpdate",
			(event: Types.Campaign.WorkerEventBlueFlightGroupsUpdate) => {
				setFlightGroups(Array.from(event.items.values()).sort((a, b) => sortDesc(a, b, (o) => o.startTime)));
			},
		);
	});

	onCleanup(() => {
		workerSubscription?.dispose();
	});

	const date = createMemo(() => {
		const d = timerToDate(state.timer);

		return d;
	});

	const isNight = createMemo(() => {
		if (dataStore.mapInfo == null) {
			return false;
		}

		const hour = date().getUTCHours();

		return hour < dataStore.mapInfo.night.endHour || hour >= dataStore.mapInfo.night.startHour;
	});

	return (
		<div class={Styles.sidebar}>
			<Show when={isNight() && !state.allowNightMissions}>
				<div class={Styles["night-wrapper"]}>
					<p class={Styles["night-description"]}>No flight groups are planned during the night.</p>
					<div class={Styles["night-buttons"]}>
						<Components.Button onPress={() => skipToNextDay?.(dataStore)}>
							Jump to Day {date().getDate() + 1}
						</Components.Button>
					</div>
				</div>
			</Show>
			<h3 class={Styles.sidebar__title}>Flight Groups</h3>
			<Components.ScrollContainer>
				<Components.List class={Styles.sidebar__list}>
					<For each={flightGroups()}>{(fg) => <FlightGroupItem flightGroup={fg} />}</For>
				</Components.List>
			</Components.ScrollContainer>
		</div>
	);
};
