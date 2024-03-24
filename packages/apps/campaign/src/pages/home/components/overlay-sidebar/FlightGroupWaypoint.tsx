import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, Show } from "solid-js";

import Styles from "./Item.module.less";

export function FlightGroupWaypoint(props: { waypoint: DcsJs.InputTypes.Waypoint }) {
	const endTime = createMemo(() =>
		props.waypoint.duration == null ? undefined : props.waypoint.arrivalTime + props.waypoint.duration,
	);

	return (
		<div class={cnb(Styles.header)}>
			<h3 class={Styles["item-title"]}>{props.waypoint.name}</h3>
			<Show when={props.waypoint.type !== "RaceTrack End"}>
				<Components.Clock value={props.waypoint.arrivalTime} />
				<Show when={endTime() != null}>
					<>
						<span> - </span>
						<Components.Clock value={endTime()} />
					</>
				</Show>
			</Show>
		</div>
	);
}
