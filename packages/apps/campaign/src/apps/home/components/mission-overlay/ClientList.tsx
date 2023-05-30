import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { getClientFlightGroups } from "../../../../utils";
import Styles from "./ClientList.module.less";

function Item(props: { flightGroup: DcsJs.CampaignFlightGroup }) {
	const [state] = useContext(CampaignContext);
	const aircraftTypes = () => {
		const acTypes = new Map<string, number>();
		props.flightGroup.units.forEach((u) => {
			if (!u.client) {
				return;
			}
			const aircraft = state.blueFaction?.inventory.aircrafts[u.id];

			if (aircraft == null) {
				return;
			}

			acTypes.set(aircraft.aircraftType, (acTypes.get(aircraft.aircraftType) ?? 0) + 1);
		});

		return Array.from(acTypes);
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
						{acType[1]}x {acType[0]}
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
