import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, For, useContext } from "solid-js";

import { CampaignContext, Clock, FlightGroupButtons } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import { OverlaySidebarContext } from "../overlay-sidebar";
import Styles from "./FlightGroupItem.module.less";

export const FlightGroupItem = (props: {
	flightGroup: DcsJs.CampaignFlightGroup;
	faction: DcsJs.CampaignFaction | undefined;
}) => {
	const [state, { selectFlightGroup }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);
	const [, { openFlightGroup }] = useContext(OverlaySidebarContext);

	const aircrafts = createMemo(() => {
		const list: Array<{ name: string; aircraftType: string; isClient: boolean }> = [];
		const faction = props.faction;

		if (faction?.inventory == null) {
			return [];
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

		return list;
	});

	const onPress = () => {
		selectFlightGroup?.({ ...props.flightGroup });
		openFlightGroup?.(props.flightGroup.id, "blue");
	};

	return (
		<Components.ListItem class={Styles.item}>
			<Components.Card class={Styles.card} onPress={onPress} selected={props.flightGroup.startTime < state.timer}>
				<div class={Styles.name}>{props.flightGroup.name}</div>
				<FlightGroupButtons coalition="blue" flightGroup={props.flightGroup} />
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
