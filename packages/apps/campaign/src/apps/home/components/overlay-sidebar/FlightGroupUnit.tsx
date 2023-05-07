import * as DcsJs from "@foxdelta2/dcsjs";
import { createMemo, For, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import { RunningCampaignState } from "../../../../logic/types";
import { getCoalitionFaction, getWeaponsForFlightGroupUnit } from "../../../../logic/utils";
import Style from "./Item.module.less";

export function FlightGroupUnit(props: { unit: DcsJs.CampaignFlightGroupUnit; coalition: DcsJs.CampaignCoalition }) {
	const [state] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);

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
			<div class={Style.header}>
				<h3 class={Style.subtitle}>{props.unit.name}</h3>
				<p>{dataStore.aircrafts?.[aircraft().aircraftType]?.display_name ?? aircraft().aircraftType}</p>
			</div>
			<For each={[...weapons()]}>
				{([, { item, count }]) => (
					<div class={Style.weapon}>
						<div class={Style.weapon__count}>{count}x</div>
						<div>{item.displayName}</div>
					</div>
				)}
			</For>
		</div>
	);
}
