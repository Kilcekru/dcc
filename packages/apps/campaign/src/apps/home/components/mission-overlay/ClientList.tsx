import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { useDataStore } from "../../../../components/DataProvider";
import { getClientFlightGroups } from "../../../../utils";
import Styles from "./ClientList.module.less";

function Item(props: { flightGroup: DcsJs.FlightGroup }) {
	const [state] = useContext(CampaignContext);
	const dataStore = useDataStore();

	const aircraftTypes = () => {
		const acTypes = new Map<DcsJs.AircraftType, number>();
		props.flightGroup.units.forEach((u) => {
			if (!u.client) {
				return;
			}
			const aircraft = state.blueFaction?.inventory.aircrafts[u.id];

			if (aircraft == null) {
				return;
			}

			acTypes.set(
				aircraft.aircraftType as DcsJs.AircraftType,
				(acTypes.get(aircraft.aircraftType as DcsJs.AircraftType) ?? 0) + 1
			);
		});

		return Array.from(acTypes);
	};

	const aircraftName = (aircraftType: DcsJs.AircraftType) => {
		const aircrafts = dataStore.aircrafts;
		if (aircrafts == null) {
			return aircraftType;
		}

		return aircrafts[aircraftType]?.display_name ?? aircraftType;
	};

	return (
		<div class={Styles["flight-group"]}>
			<div class={Styles.header}>
				<p class={Styles.name}>{props.flightGroup.name}</p>
				<Components.TaskLabel task={props.flightGroup.task} />
			</div>
			<For each={aircraftTypes()}>
				{(acType) => (
					<p>
						{acType[1]}x {aircraftName(acType[0])}
					</p>
				)}
			</For>
		</div>
	);
}
export function ClientList() {
	const [state] = useContext(CampaignContext);

	const clientFlightGroups = () => {
		return getClientFlightGroups(state.blueFaction?.packages);
	};

	return (
		<div>
			<Show when={clientFlightGroups().length > 1}>
				<h2 class={Styles.title}>{clientFlightGroups().length} Client Flight Groups</h2>
			</Show>
			<Show when={clientFlightGroups().length === 1}>
				<h2 class={Styles.title}>Player Flight Group</h2>
			</Show>
			<For each={clientFlightGroups()}>{(fg) => <Item flightGroup={fg} />}</For>
		</div>
	);
}
