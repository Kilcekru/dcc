import * as DcsJs from "@foxdelta2/dcsjs";
import { cnb } from "cnbuilder";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { useDataStore } from "../../../../components/DataProvider";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction, getWeaponsForFlightGroupUnit } from "../../../../logic/utils";
import Styles from "./Item.module.less";

export function FlightGroupUnit(props: { unit: DcsJs.CampaignFlightGroupUnit; coalition: DcsJs.CampaignCoalition }) {
	const [state] = useContext(CampaignContext);
	const dataStore = useDataStore();

	const aircraft = createMemo(() => {
		const faction = getCoalitionFaction(props.coalition, state as RunningCampaignState);

		const ac = faction.inventory.aircrafts[props.unit.id];

		if (ac == null) {
			// eslint-disable-next-line no-console
			console.error("FlightGroupUnit", "aircraft not found", props.unit);
			throw "aircraft not found";
		}

		return ac;
	});

	const weapons = createMemo(() => getWeaponsForFlightGroupUnit(aircraft()));

	return (
		<div>
			<div class={cnb(Styles.header, props.unit.client ? Styles["header--with-client"] : "")}>
				<h3 class={Styles["item-title"]}>{props.unit.name}</h3>
				<p>{dataStore.aircrafts?.[aircraft().aircraftType]?.display_name ?? aircraft().aircraftType}</p>
				<Show when={props.unit.client}>
					<p class={Styles.player}>Player</p>
				</Show>
			</div>
			<For each={[...weapons()]}>
				{([, { item, count }]) => (
					<div class={Styles.weapon}>
						<div class={Styles.weapon__count}>{count}x</div>
						<div>{item.displayName}</div>
					</div>
				)}
			</For>
		</div>
	);
}
