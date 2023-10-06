import "./Briefing.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createMemo, For, Show } from "solid-js";

import Styles from "./Briefing.module.less";

export function Briefing(props: { data: Types.Campaign.BriefingDocument }) {
	const dataAircraft = createMemo(() => {
		const unit = props.data.flightGroup.units[0];

		if (unit == null) {
			return;
		}

		const aircraft = props.data.faction.inventory.aircrafts[unit.id];

		if (aircraft == null) {
			return;
		}

		return props.data.dataAircrafts[aircraft.aircraftType as DcsJs.AircraftType];
	});
	const flightGroupAircraftType = (flightGroup: DcsJs.FlightGroup) => {
		const unit = flightGroup.units[0];

		if (unit == null) {
			return "";
		}

		const aircraft = props.data.faction.inventory.aircrafts[unit.id];

		if (aircraft == null) {
			return "";
		}

		const dataAircraft = props.data.dataAircrafts[aircraft.aircraftType as DcsJs.AircraftType];

		return `${flightGroup.units.length}x ${dataAircraft?.display_name ?? ""}`;
	};

	const airdromeData = createMemo(() => {
		const airdrome = props.data.mapData.airdromes[props.data.flightGroup.airdromeName];

		if (airdrome == null) {
			if (
				props.data.flightGroup.airdromeName === "CVN-72 Abraham Lincoln" ||
				props.data.flightGroup.airdromeName === "Admiral Kuznetsov" ||
				props.data.flightGroup.airdromeName === "CV-59 Forrestal"
			) {
				if (dataAircraft()?.name === "AV8BNA" || dataAircraft()?.isHelicopter) {
					return {
						frequency: 128.5,
						tcn: "12X",
						icls: "12",
						name: "LHA Tarawa",
					};
				} else {
					return {
						frequency: 128,
						tcn: "11X",
						icls: "11",
						name: props.data.flightGroup.airdromeName,
					};
				}
			} else {
				return {
					frequency: undefined,
					tcn: "",
					icls: "",
					name: props.data.flightGroup.airdromeName,
				};
			}
		} else {
			return {
				frequency: airdrome.frequency,
				tcn: "",
				icls: "",
				name: props.data.flightGroup.airdromeName,
			};
		}
	});

	const taskDescription = createMemo(() => {
		switch (props.data.flightGroup.task) {
			case "CAS": {
				return "Destroy the enemy ground units at waypoint 3 'CAS'";
			}
			case "Pinpoint Strike": {
				return "Destroy the enemy buildings at waypoint 3 'Strike'";
			}
			case "Escort": {
				return "Protect the Strike flight from enemy fighters";
			}
			case "DEAD": {
				return "Destroy the enemy tracking radar(SAM) at waypoint 3 'DEAD'";
			}
			case "CAP": {
				return "Protect the area around waypoint 1 and 2 from enemy fighters";
			}
			case "CSAR": {
				return "Find and rescue the downed pilot at waypoint 2";
			}
			default: {
				return "";
			}
		}
	});

	const taskHint = createMemo(() => {
		switch (props.data.flightGroup.task) {
			case "CAS": {
				return "JTAC is available via the Communication Menu for 9-Line. Additionally the JTAC can mark the units for you with 'F-10. Other...'.";
			}
			case "Escort": {
				return "With the 'F-10. Other...' entry in the Communication Menu you can request a BRA Call for your escort destination at any time.";
			}
			case "CSAR": {
				return "In the 'F-10. Other...' entry in the Communication Menu you have options to locate the pilot";
			}
			default: {
				return undefined;
			}
		}
	});
	return (
		<div class={Styles.briefing}>
			<h1 class={Styles.name}>{props.data.flightGroup.name}</h1>
			<h3 class={Styles.task}>{props.data.flightGroup.task}</h3>
			<p class={Styles.taskDescription}>{taskDescription()}</p>
			<Show when={taskHint() != null}>
				<p class={Styles.hint}>{taskHint()}</p>
			</Show>
			<h2 class={Styles.title}>Airbase</h2>
			<div class={Styles.airbase}>
				<p class={Styles.label} />
				<p class={Styles.label}>Name</p>
				<p class={Styles.label}>Freq.</p>
				<p>DEP</p>
				<p>{airdromeData().name}</p>
				<p>{airdromeData().frequency}</p>
				<p>ARR</p>
				<p>{airdromeData().name}</p>
				<p>{airdromeData().frequency}</p>
			</div>
			<h2 class={Styles.title}>Package</h2>
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
			<h2 class={Styles.title}>Radio</h2>
			<div class={Styles.radio}>
				<p class={Styles.label}>Chl.</p>
				<p class={Styles.label}>Freq.</p>
				<p class={Styles.label}>Name</p>
				<p class={Styles.label}>1</p>
				<p>{props.data.package.frequency}</p>
				<p>Package</p>
				<p class={Styles.label}>2</p>
				<p>{airdromeData().frequency}</p>
				<p>{airdromeData().name}</p>
				<p class={Styles.label}>3</p>
				<p>{props.data.faction.awacsFrequency}</p>
				<p>AWACS</p>
				{props.data.flightGroup.jtacFrequency != null ? (
					<>
						<p class={Styles.label}>4</p>
						<p>{props.data.flightGroup.jtacFrequency}</p>
						<p>JTAC</p>
					</>
				) : null}
			</div>
			<h2 class={Styles.title}>Flightplan</h2>
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
								<p class={Styles.label}>{i()}</p>
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
