import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { cnb } from "cnbuilder";
import { createMemo, Show } from "solid-js";

import Styles from "./Item.module.less";

export function FlightGroupUnit(props: { aircraft: Types.Serialization.AircraftSerialized }) {
	const displayName = createMemo(() => {
		return DcsJs.aircrafts?.[props.aircraft.aircraftType]?.display_name ?? props.aircraft.aircraftType;
	});

	// TODO
	// const weapons = createMemo(() => getWeaponsForFlightGroupUnit(props.aircraft));

	return (
		<div>
			<div class={cnb(Styles.header, props.aircraft.isClient ? Styles["header--with-client"] : "")}>
				<h3 class={Styles["item-title"]}>{props.aircraft.name}</h3>
				<p>{displayName()}</p>
				<Show when={props.aircraft.isClient}>
					<p class={Styles.player}>Player</p>
				</Show>
			</div>
			{/* <For each={[...weapons()]}>
				{([, { item, count }]) => (
					<div class={Styles.weapon}>
						<div class={Styles.weapon__count}>{count}x</div>
						<div>{item.displayName}</div>
					</div>
				)}
				</For> */}
		</div>
	);
}
