import "./Briefing.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { For } from "solid-js";

import Styles from "./Briefing.module.less";

const FlightPositionMap = new Map([
	[0, "Lead"],
	[1, "Wing"],
	[2, "Element"],
	[3, "Wing"],
]);

export function Briefing(props: { data: Types.Campaign.BriefingDocument }) {
	const flightGroupAircraftType = (flightGroup: DcsJs.FlightGroup) => {
		const unit = flightGroup.units[0];

		if (unit == null) {
			return "";
		}

		const aircraft = props.data.aircraftInventory[unit.id];

		if (aircraft == null) {
			return "";
		}

		const dataAircraft = props.data.dataAircrafts[aircraft.aircraftType as DcsJs.AircraftType];

		return `${flightGroup.units.length}x ${dataAircraft?.display_name ?? ""}`;
	};
	return (
		<div class={Styles.briefing}>
			<h1>{props.data.flightGroup.name}</h1>
			<h2>Flight</h2>
			<div class={Styles.flight}>
				<p class={Styles.label}>Position</p>
				<p class={Styles.label}>Name</p>
				<For each={props.data.flightGroup.units}>
					{(unit, index) => (
						<>
							<p class={Styles.label}>
								{index() + 1} {FlightPositionMap.get(index())}
							</p>
							<p>{unit.name}</p>
						</>
					)}
				</For>
			</div>
			<h2>Package</h2>
			<div class={Styles.package}>
				<p class={Styles.label}>Callsign</p>
				<p class={Styles.label}>Aircraft Type</p>
				<p class={Styles.label}>Task</p>
				<For each={props.data.package.flightGroups}>
					{(fg) => (
						<>
							<p>{fg.name}</p>
							<p>{flightGroupAircraftType(fg)}</p>
							<p>{fg.task}</p>
						</>
					)}
				</For>
			</div>
			<h2>Radio</h2>
			<div class={Styles.radio}>
				<p class={Styles.comm1}>COMM 1</p>
				<p class={Styles.comm2}>COMM 2</p>
				<p class={Styles.label}>Channel</p>
				<p class={Styles.label}>Frequency</p>
				<p class={Styles.label}>Name</p>
				<p class={Styles.label}>Channel</p>
				<p class={Styles.label}>Frequency</p>
				<p class={Styles.label}>Name</p>
				<p>1</p>
				<p>{props.data.package.frequency}</p>
				<p>Package</p>
				<p>1</p>
				<p>123</p>
				<p>{props.data.flightGroup.airdromeName}</p>
				<p>2</p>
				<p>123</p>
				<p>{props.data.flightGroup.airdromeName}</p>
				<div />
				<div />
				<div />
				<p>3</p>
				<p>123</p>
				<p>AWACS</p>
				<div />
				<div />
				<div />
			</div>
			<h2>Flightplan</h2>
			<div class={Styles["flight-plan"]}>
				<p class={Styles.label}>Nr.</p>
				<p class={Styles.label}>Name</p>
				<p class={Styles.label}>TOS</p>
				<p class={Styles.label}>Heading</p>
				<p class={Styles.label}>Distance</p>
				<p class={Styles.label}>Speed</p>
				<For each={props.data.flightGroup.waypoints}>
					{(wp, i) => {
						const missionTime = wp.time + props.data.flightGroup.startTime;
						const time = wp.name === "Take Off" ? missionTime + 600 : missionTime;
						// eslint-disable-next-line solid/reactivity
						const prevWp = props.data.flightGroup.waypoints[i() - 1];
						const distance =
							prevWp == null
								? "-"
								: Math.round(
										Utils.metersToNauticalMiles(Utils.distanceToPosition(wp.position, prevWp.position)),
								  ).toString();
						const heading =
							prevWp == null
								? "-"
								: Math.round(Utils.positiveDegrees(Utils.headingToPosition(prevWp.position, wp.position))).toString();
						const speed = Math.round(Utils.metersPerSecondToKnots(wp.speed));

						return (
							<>
								<p class={Styles.label}>{i() + 1}</p>
								<p>{wp.name}</p>
								<p>
									<Components.Clock value={time} />
									{wp.duration == null ? null : (
										<>
											<span>-</span>
											<Components.Clock value={props.data.flightGroup.startTime + wp.time + wp.duration} />
										</>
									)}
								</p>
								<p>{heading}</p>
								<p>{distance}</p>

								<p>{speed}</p>
							</>
						);
					}}
				</For>
			</div>
		</div>
	);
}
