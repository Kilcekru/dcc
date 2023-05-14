import "./FlightGroupItem.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { Icons } from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createEffect, createMemo, createSignal, For, Show, useContext } from "solid-js";

import { CampaignContext, Clock } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import { OverlaySidebarContext } from "../overlay-sidebar";
import Styles from "./FlightGroupItem.module.less";

export const FlightGroupItem = (props: {
	flightGroup: DcsJs.CampaignFlightGroup;
	faction: DcsJs.CampaignFaction | undefined;
}) => {
	const [state, { selectFlightGroup, setClient }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);
	const [clientCount, setClientCount] = createSignal(0);
	const [aircrafts, setAircrafts] = createSignal<Array<{ name: string; aircraftType: string; isClient: boolean }>>([]);
	const [, { openFlightGroup }] = useContext(OverlaySidebarContext);
	const hasPlayableAircrafts = createMemo(() =>
		aircrafts().some((ac) => {
			const aircraft = dataStore.aircrafts?.[ac.aircraftType as DcsJs.AircraftType];

			if (aircraft == null) {
				return false;
			}

			return aircraft.controllable;
		})
	);

	createEffect(() => {
		setClientCount(props.flightGroup.units.filter((unit) => unit.client).length);
	});
	const onPress = () => {
		selectFlightGroup?.({ ...props.flightGroup });
		openFlightGroup?.(props.flightGroup.id, "blue");
	};

	const updateClients = (value: number) => {
		setClient?.(props.flightGroup.id, clientCount() + value);
	};

	createEffect(() => {
		const list: Array<{ name: string; aircraftType: string; isClient: boolean }> = [];
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
				name: unit.name,
				aircraftType: aircraft.aircraftType,
				isClient: unit.client,
			});
		});

		setAircrafts(list);
	});

	return (
		<Components.ListItem class={Styles.item}>
			<Components.Card class={Styles.card} onPress={onPress} selected={props.flightGroup.startTime < state.timer}>
				<div class={Styles.name}>{props.flightGroup.name}</div>
				<Show when={hasPlayableAircrafts()}>
					<Show when={clientCount() >= 1}>
						<Components.Button class={Styles.clientRemoveButton} onPress={() => updateClients(-1)}>
							<Icons.PersonRemove />
						</Components.Button>
					</Show>
					<Components.Button class={Styles.clientAddButton} onPress={() => updateClients(1)}>
						<Icons.PersonAdd />
						<Show when={clientCount() === 0}>
							<span>JOIN</span>
						</Show>
					</Components.Button>
				</Show>
				<Components.TaskLabel task={props.flightGroup.task} class={Styles.task} />
				<div class={Styles.stats}>
					<div>
						<p class={Styles.label}>Start</p>
						<Clock value={props.flightGroup.startTime} />
					</div>
					<div>
						<p class={Styles.label}>TOT</p>
						<Clock value={props.flightGroup.tot} />
					</div>
					<div>
						<p class={Styles.label}>Duration</p>
						<Clock value={props.flightGroup.landingTime - props.flightGroup.startTime} />
					</div>
				</div>
				<div class={Styles["aircrafts-wrapper"]}>
					<p class={Styles.label}>Aircrafts</p>
					<div class={Styles.aircrafts}>
						<For each={aircrafts()}>
							{(aircraft) => (
								<>
									<div class={cnb(aircraft.isClient ? Styles["is-client"] : null)}>{aircraft.name}</div>
									<div class={cnb(aircraft.isClient ? Styles["is-client"] : null)}>
										{dataStore.aircrafts?.[aircraft.aircraftType as DcsJs.AircraftType]?.display_name ??
											aircraft.aircraftType}
									</div>
									<div class={cnb(aircraft.isClient ? Styles["is-client"] : null)}>
										{aircraft.isClient ? "Player" : ""}
									</div>
								</>
							)}
						</For>
					</div>
				</div>
			</Components.Card>
		</Components.ListItem>
	);
};
