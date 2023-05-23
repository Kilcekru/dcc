import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, Show, useContext } from "solid-js";

import { CampaignContext } from "../CampaignProvider";
import { DataContext } from "../DataProvider";
import { useFaction } from "../utils";
import Styles from "./FlightGroupButtons.module.less";

export function FlightGroupButtons(props: {
	coalition: DcsJs.CampaignCoalition | undefined;
	flightGroup: DcsJs.CampaignFlightGroup | undefined;
	class?: string;
}) {
	const [, { setClient }] = useContext(CampaignContext);
	// eslint-disable-next-line solid/reactivity
	const faction = useFaction(props.coalition);
	const dataStore = useContext(DataContext);

	const aircrafts = createMemo(() => {
		const list: Array<{ name: string; aircraftType: string; isClient: boolean }> = [];

		if (faction()?.inventory == null) {
			return [];
		}

		props.flightGroup?.units.forEach((unit) => {
			const aircraft = faction()?.inventory.aircrafts[unit.id];

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

	const clientCount = createMemo(() => {
		return props.flightGroup?.units.filter((unit) => unit.client).length ?? 0;
	});

	const hasPlayableAircrafts = createMemo(() =>
		aircrafts().some((ac) => {
			const aircraft = dataStore.aircrafts?.[ac.aircraftType as DcsJs.AircraftType];

			if (aircraft == null) {
				return false;
			}

			return aircraft.controllable;
		})
	);

	const updateClients = (value: number) => {
		const fg = props.flightGroup;

		if (fg == null) {
			return;
		}

		setClient?.(fg.id, clientCount() + value);
	};

	const disableJoinButton = createMemo(() => aircrafts().length <= clientCount());
	return (
		<Show when={hasPlayableAircrafts()}>
			<div class={cnb(props.class)}>
				<Show when={clientCount() >= 1}>
					<Components.Tooltip text="Remove Player from Flight Group" class={Styles.clientRemoveButton}>
						<Components.Button onPress={() => updateClients(-1)}>
							<Components.Icons.PersonRemove />
						</Components.Button>
					</Components.Tooltip>
				</Show>
				<Components.Tooltip
					text={clientCount() === 0 ? "Join Flight Group" : "Add another Player"}
					class={Styles.clientAddButton}
					disabled={disableJoinButton()}
				>
					<Components.Button onPress={() => updateClients(1)} disabled={disableJoinButton()}>
						<Components.Icons.PersonAdd />
						<Show when={clientCount() === 0}>
							<span>JOIN</span>
						</Show>
					</Components.Button>
				</Components.Tooltip>
			</div>
		</Show>
	);
}
