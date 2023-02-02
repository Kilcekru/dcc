import "./FlightGroupItem.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, createSignal } from "solid-js";

import { ListItem } from "../../../../components";
import { getFlightGroups } from "../../../../utils";
import styles from "./FlightGroupItem.module.less";

export const AircraftItem = (props: {
	aircraft: DcsJs.CampaignAircraft;
	faction: DcsJs.CampaignFaction | undefined;
}) => {
	const [flightGroup, setFlightGroup] = createSignal<DcsJs.CampaignFlightGroup | undefined>(undefined);

	createEffect(() => {
		setFlightGroup(
			getFlightGroups(props.faction?.packages).find((fg) => fg.units.some((u) => u.id === props.aircraft.id))
		);
	});
	return (
		<ListItem class={styles.item}>
			<Components.Card class={styles.card}>
				<div class={styles.grid}>
					<div>{props.aircraft.id}</div>
					<div>{props.aircraft.aircraftType}</div>
					<div>{props.aircraft.state}</div>
					<div>{props.aircraft.alive ? "Alive" : "Destroyed"}</div>
					<div>{flightGroup()?.name}</div>
				</div>
			</Components.Card>
		</ListItem>
	);
};
