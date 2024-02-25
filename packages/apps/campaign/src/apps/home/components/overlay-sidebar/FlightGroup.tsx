import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext, FlightGroupButtons, useGetEntity } from "../../../../components";
import { Flag } from "./Flag";
import { FlightGroupUnit } from "./FlightGroupUnit";
import { FlightGroupWaypoint } from "./FlightGroupWaypoint";
import Styles from "./Item.module.less";

export function FlightGroup(props: { flightGroup: Types.Serialization.FlightGroupSerialized }) {
	const [state, { selectEntity }] = useContext(CampaignContext);
	const getEntity = useGetEntity();
	const countryName = createMemo(() => {
		const coalition = props.flightGroup.coalition;
		const faction = state.factionDefinitions[coalition];

		if (faction == null) {
			return undefined;
		}
		return faction.countryName;
	});

	const target = createMemo(() => {
		const targetId = props.flightGroup.combat?.targetId;
		if (targetId == null) {
			return undefined;
		}
		return getEntity<Types.Serialization.FlightGroupSerialized>(targetId);
	});

	const waypoints = createMemo(() => {
		const flightplan = getEntity<Types.Serialization.FlightplanSerialized>(props.flightGroup.flightplanId);
		if (flightplan == null) {
			return [];
		}

		const waypoints: DcsJs.InputTypes.Waypoint[] = [];

		for (const wp of flightplan.waypoints) {
			waypoints.push({
				arrivalTime: wp.arrivalTime,
				name: wp.name,
				onGround: wp.onGround,
				position: wp.position,
				type: wp.type,
				duration: wp.duration,
			});

			if (wp.raceTrack != null) {
				waypoints.push({
					arrivalTime: wp.raceTrack.arrivalTime,
					name: wp.raceTrack.name,
					onGround: wp.onGround,
					position: wp.raceTrack.position,
					type: "RaceTrack End",
				});
			}
		}

		return waypoints;
	});

	return (
		<>
			<div>
				<Flag countryName={countryName()} />
				<h2 class={Styles.title}>{props.flightGroup.name}</h2>
				<Components.TaskLabel task={props.flightGroup.task} class={Styles.task} />
				<FlightGroupButtons flightGroup={props.flightGroup} class={Styles["flight-group-buttons"]} />
				{/* <Show when={(flightGroup()?.startTime ?? 999999999) < state.timer}>
					<div class={Styles.stats}>
						<Components.Stat>
							<Components.StatLabel>Waypoint</Components.StatLabel>
							<Components.StatValue>{activeWaypoint()?.name}</Components.StatValue>
						</Components.Stat>
					</div>
</Show> */}
				<Show when={props.flightGroup.combat != null}>
					<div
						onClick={() => {
							const targetId = target()?.id;

							if (targetId == null) {
								return;
							}

							selectEntity?.(targetId);
						}}
					>
						<h3>In Combat</h3>
						<p>{target()?.name}</p>
					</div>
				</Show>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={props.flightGroup.aircraftIds}>
						{(id) => {
							const aircraft = getEntity<Types.Serialization.AircraftSerialized>(id);
							return (
								<Components.ListItem>
									<FlightGroupUnit aircraft={aircraft} />
								</Components.ListItem>
							);
						}}
					</For>
					<h3 class={Styles.subtitle}>Waypoints</h3>
					<For each={waypoints()}>
						{(wp) => {
							return (
								<Components.ListItem>
									<FlightGroupWaypoint waypoint={wp} />
								</Components.ListItem>
							);
						}}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</>
	);
}
