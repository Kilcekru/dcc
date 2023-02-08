import "./FlightGroupItem.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { Icons } from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createEffect, createSignal, For, Show, useContext } from "solid-js";

import { CampaignContext, Clock } from "../../../../components";
import styles from "./FlightGroupItem.module.less";

export const FlightGroupItem = (props: {
	flightGroup: DcsJs.CampaignFlightGroup;
	faction: DcsJs.CampaignFaction | undefined;
}) => {
	const [, { selectFlightGroup, setClient }] = useContext(CampaignContext);
	const [clientCount, setClientCount] = createSignal(0);
	const [aircrafts, setAircrafts] = createSignal<Array<{ callSign: string; aircraftType: string; isClient: boolean }>>(
		[]
	);

	createEffect(() => {
		setClientCount(props.flightGroup.units.filter((unit) => unit.client).length);
	});
	const onPress = () => {
		selectFlightGroup?.(props.flightGroup);
	};

	const updateClients = (value: number) => {
		setClient?.(props.flightGroup.id, clientCount() + value);
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

	createEffect(() => {
		const list: Array<{ callSign: string; aircraftType: string; isClient: boolean }> = [];
		const faction = props.faction;

		if (faction?.inventory == null) {
			return;
		}

		props.flightGroup.units.forEach((unit) => {
			const aircraft = faction.inventory.aircrafts[unit.id];

			if (aircraft == null) {
				return;
			}

			list.push({
				callSign: unit.callSign,
				aircraftType: aircraft.aircraftType,
				isClient: unit.client,
			});
		});

		setAircrafts(list);
	});

	return (
		<Components.ListItem class={styles.item}>
			<Components.Card class={styles.card} onPress={onPress}>
				<div class={styles.name}>{props.flightGroup.name}</div>
				<Show when={clientCount() >= 1}>
					<Components.Button class={styles.clientRemoveButton} onPress={() => updateClients(-1)}>
						<Icons.PersonRemove />
					</Components.Button>
				</Show>
				<Components.Button class={styles.clientAddButton} onPress={() => updateClients(1)}>
					<Icons.PersonAdd />
				</Components.Button>
				<div class={cnb(styles.task, taskClass())}>{props.flightGroup.task}</div>
				<div class={styles.stats}>
					<div>
						<p class={styles.label}>Start</p>
						<Clock value={props.flightGroup.startTime} />
					</div>
					<div>
						<p class={styles.label}>TOT</p>
						<Clock value={props.flightGroup.tot} />
					</div>
					<div>
						<p class={styles.label}>Duration</p>
						<Clock value={props.flightGroup.landingTime - props.flightGroup.startTime} />
					</div>
				</div>
				<div class={styles["aircrafts-wrapper"]}>
					<p class={styles.label}>Aircrafts</p>
					<div class={styles.aircrafts}>
						<For each={aircrafts()}>
							{(aircraft) => (
								<>
									<div>{aircraft.callSign}</div>
									<div>{aircraft.aircraftType}</div>
									<div>{aircraft.isClient ? "Player" : ""}</div>
								</>
							)}
						</For>
					</div>
				</div>
			</Components.Card>
		</Components.ListItem>
	);
};
