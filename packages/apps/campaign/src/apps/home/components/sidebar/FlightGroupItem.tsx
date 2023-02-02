import "./FlightGroupItem.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createSignal, Show, useContext } from "solid-js";

import { CampaignContext, Clock, ListItem, NumberField } from "../../../../components";
import styles from "./FlightGroupItem.module.less";

export const FlightGroupItem = (props: { flightGroup: DcsJs.CampaignFlightGroup }) => {
	const [, { selectFlightGroup, setClient }] = useContext(CampaignContext);
	const [expanded, setExpanded] = createSignal(false);

	const onPress = () => {
		setExpanded(true);
		selectFlightGroup?.(props.flightGroup);
	};

	const onChange = (value: number) => {
		setClient?.(props.flightGroup.id, value);
	};

	const taskClass = () => {
		switch (props.flightGroup.task) {
			case "AWACS":
				return styles["task--awacs"];
			case "CAS":
				return styles["task--cas"];
			case "CAP":
				return styles["task--cap"];
			default:
				return undefined;
		}
	};

	return (
		<ListItem class={styles.item}>
			<Components.Card class={styles.card}>
				<div class={styles.grid} onClick={onPress}>
					<div>{props.flightGroup.name}</div>
					<div>
						<Clock value={props.flightGroup.startTime} />
					</div>
					<div>
						<Clock value={props.flightGroup.tot} />
					</div>
					<div>
						<Clock value={props.flightGroup.landingTime - props.flightGroup.startTime} />
					</div>
				</div>
				<div class={cnb(styles.task, taskClass())}>{props.flightGroup.task}</div>
				<Show when={props.flightGroup.units.some((unit) => unit.client)}>
					<div class={styles["client-batch"]}>CLIENT</div>
				</Show>
				<Show when={expanded()}>
					<div>
						Clients{" "}
						<NumberField value={props.flightGroup.units.filter((unit) => unit.client).length} onChange={onChange} />
					</div>
				</Show>
			</Components.Card>
		</ListItem>
	);
};
