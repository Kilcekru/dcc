import "./FlightGroupItem.less";

import type * as DcsJs from "@foxdelta2/dcsjs";

import { ListItem } from "../../../../components";
import { Card } from "../../../../components/card/Card";
import styles from "./FlightGroupItem.module.less";

export const AircraftItem = (props: { aircraft: DcsJs.CampaignAircraft }) => {
	return (
		<ListItem class={styles.item}>
			<Card class={styles.card}>
				<div class={styles.grid}>
					<div>{props.aircraft.id}</div>
					<div>{props.aircraft.aircraftType}</div>
					<div>{props.aircraft.state}</div>
					<div>{props.aircraft.alive ? "Alive" : "Destroyed"}</div>
				</div>
			</Card>
		</ListItem>
	);
};
