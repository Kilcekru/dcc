import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { cnb } from "cnbuilder";
import { createMemo, Show } from "solid-js";

import { sendWorkerMessage } from "../../worker";
import { useDataStore } from "../DataProvider";
import { useGetEntity } from "../utils";
import Styles from "./FlightGroupButtons.module.less";

export function FlightGroupButtons(props: { flightGroup: Types.Serialization.FlightGroupSerialized; class?: string }) {
	const dataStore = useDataStore();
	const getEntity = useGetEntity();

	const aircrafts = createMemo(() => {
		const list: Array<{ name: string; aircraftType: string; isClient: boolean }> = [];

		props.flightGroup?.aircraftIds.forEach((id) => {
			const aircraft = getEntity<Types.Serialization.AircraftSerialized>(id);

			if (aircraft == null) {
				return;
			}

			list.push({
				name: aircraft.name ?? "",
				aircraftType: aircraft.aircraftType,
				isClient: aircraft.isClient,
			});
		});

		return list;
	});

	const clientCount = createMemo(() => {
		let clientCount = 0;

		for (const id of props.flightGroup?.aircraftIds ?? []) {
			const aircraft = getEntity<Types.Serialization.AircraftSerialized>(id);

			if (aircraft.isClient) {
				clientCount++;
			}
		}

		return clientCount;
	});

	const hasPlayableAircrafts = createMemo(() =>
		aircrafts().some((ac) => {
			const aircraft = dataStore.aircrafts?.[ac.aircraftType as DcsJs.AircraftType];

			if (aircraft == null) {
				return false;
			}

			return aircraft.controllable;
		}),
	);

	const updateClients = (value: number) => {
		const fg = props.flightGroup;

		if (fg == null) {
			return;
		}

		sendWorkerMessage({
			name: "setClient",
			payload: {
				flightGroupId: fg.id,
				count: clientCount() + value,
			},
		});
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
