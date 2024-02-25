import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { For, Show, useContext } from "solid-js";

import { CampaignContext, useGetEntity } from "../../../../components";
import Styles from "./ClientList.module.less";

function Item(props: { flightGroup: Types.Serialization.FlightGroupSerialized }) {
	const getEntity = useGetEntity();

	const aircraftTypes = () => {
		const acTypes = new Map<DcsJs.AircraftType, number>();
		for (const id of props.flightGroup.aircraftIds) {
			const aircraft = getEntity<Types.Serialization.AircraftSerialized>(id);

			if (!aircraft.isClient) {
				continue;
			}

			acTypes.set(aircraft.aircraftType, (acTypes.get(aircraft.aircraftType) ?? 0) + 1);
		}

		return Array.from(acTypes);
	};

	const aircraftName = (aircraftType: DcsJs.AircraftType) => {
		return DcsJs.aircraftDefinitions[aircraftType]?.display_name ?? aircraftType;
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
		return state.flightGroups.filter((fg) => fg.hasClients);
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
