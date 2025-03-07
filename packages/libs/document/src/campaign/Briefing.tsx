import "./Briefing.less";

import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createMemo, For, Show } from "solid-js";

import Styles from "./Briefing.module.less";

export function Briefing(props: { data: Types.Campaign.BriefingDocument }) {
	const entityMap = createMemo(() => new Map(props.data.campaign.entities.map((entity) => [entity.id, entity])));
	const getEntity = createMemo(() => Utils.ECS.EntitySelector(entityMap()));

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

	const airdromeData = createMemo(() => {
		const homeBase = getEntity()<Types.Serialization.HomeBaseSerialized>(props.data.flightGroup.homeBaseId);

		switch (homeBase.type) {
			case "Airdrome": {
				const airdrome = DcsJs.Theatres[props.data.campaign.theatre].airdromeDefinitions[homeBase.name];

				if (airdrome == null) {
					throw new Error(`Airdrome ${homeBase.name} not found`);
				}

				return {
					frequency: airdrome.frequency,
					tcn: "",
					icls: "",
					name: homeBase.name,
				};
			}
			default: {
				return {
					frequency: "-",
					tcn: "",
					icls: "",
					name: homeBase.name,
				};
			}
		}
		// TODO
		/* if (airdrome == null) {
			if (
				props.data.flightGroup.airdromeName === "CVN-72 Abraham Lincoln" ||
				props.data.flightGroup.airdromeName === "Admiral Kuznetsov" ||
				props.data.flightGroup.airdromeName === "CV-59 Forrestal"
			) {
				if (playerAircraft()?.name === "AV8BNA" || playerAircraft()?.isHelicopter) {
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
		} */
	});

	function flightGroupAircraft(flightGroup: Types.Serialization.FlightGroupSerialized) {
		const firstAircraftId = flightGroup.aircraftIds[0];

		if (firstAircraftId == null) {
			throw new Error("FlightGroup has no aircrafts");
		}

		const aircraftEntity = getEntity()<Types.Serialization.AircraftSerialized>(firstAircraftId);

		return DcsJs.aircraftDefinitions[aircraftEntity.aircraftType];
	}

	const flightGroupAircraftTypeText = (flightGroup: Types.Serialization.FlightGroupSerialized) => {
		const aircraft = flightGroupAircraft(flightGroup);

		return `${flightGroup.aircraftIds.length}x ${aircraft.display_name ?? ""}`;
	};

	const jtacFrequency = createMemo(() => {
		function isCas(fg: Types.Serialization.FlightGroupSerialized): fg is Types.Serialization.CasFlightGroupSerialized {
			return fg.entityType === "CasFlightGroup";
		}

		if (isCas(props.data.flightGroup)) {
			return props.data.flightGroup.jtacFrequency;
		}

		return undefined;
	});

	const waypoints = createMemo(() => {
		const flightPlan = getEntity()<Types.Serialization.FlightplanSerialized>(props.data.flightGroup.flightplanId);

		const retVal = [];
		let index = 0;
		let prevWp: Types.Serialization.WaypointSerialized | undefined = undefined;
		for (const waypoint of flightPlan.waypoints.values()) {
			const distance =
				prevWp == null
					? "-"
					: Math.round(
							Utils.Location.metersToNauticalMiles(
								Utils.Location.distanceToPosition(waypoint.position, prevWp.position),
							),
						).toString();

			const heading =
				prevWp == null
					? "-"
					: Math.round(
							Utils.Location.positiveDegrees(Utils.Location.headingToPosition(prevWp.position, waypoint.position)),
						).toString();

			const wp = {
				index: index++,
				name: waypoint.name,
				tos: waypoint.arrivalTime,
				duration: waypoint.duration,
				speed: Math.round(Utils.Location.metersPerSecondToKnots(props.data.package.cruiseSpeed)),
				distance,
				heading,
			};

			retVal.push(wp);
			prevWp = waypoint;
		}

		return retVal;
	});

	return (
		<div class={Styles.briefing}>
			<h1 class={Styles.name}>{props.data.flightGroup.name} 22</h1>
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
				<p class={Styles.label}>TCN</p>
				<p class={Styles.label}>ICLS</p>
				<p class={Styles.label} />
				<p>DEP</p>
				<p>{airdromeData().name}</p>
				<p>{airdromeData().frequency}</p>
				<p>{airdromeData().tcn}</p>
				<p>{airdromeData().icls}</p>
				<p />
				<p>ARR</p>
				<p>{airdromeData().name}</p>
				<p>{airdromeData().frequency}</p>
				<p>{airdromeData().tcn}</p>
				<p>{airdromeData().icls}</p>
				<p />
			</div>
			<div class={Styles.package}>
				<p class={Styles.label}>Callsign</p>
				<p class={Styles.label}>Aircraft Type</p>
				<p class={Styles.label}>Task</p>
				<For each={props.data.package.flightGroupIds}>
					{(id) => {
						const fg = getEntity()<Types.Serialization.FlightGroupSerialized>(id);

						return (
							<>
								<p>{fg.name}</p>
								<p>{flightGroupAircraftTypeText(fg)}</p>
								<p>{fg.task}</p>
							</>
						);
					}}
				</For>
			</div>
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
				<p>{Utils.Config.defaults.awacsFrequency}</p>
				<p>AWACS</p>
				<Show when={jtacFrequency() != null}>
					<>
						<p class={Styles.label}>4</p>
						<p>{jtacFrequency()}</p>
						<p>JTAC</p>
					</>
				</Show>
			</div>
			<h2 class={Styles.title}>Flightplan</h2>
			<div class={Styles["flight-plan"]}>
				<p class={Styles.label}>Nr.</p>
				<p class={Styles.label}>Name</p>
				<p class={Styles.label}>TOS</p>
				<p class={Styles.label}>Heading</p>
				<p class={Styles.label}>Distance</p>
				<p class={Styles.label}>Speed</p>
				<For each={waypoints()}>
					{(wp) => {
						return (
							<>
								<p class={Styles.label}>{wp.index}</p>
								<p>{wp.name}</p>
								<p>
									<Components.Clock value={wp.tos} />
									{wp.duration == null ? null : (
										<>
											<span>-</span>
											<Components.Clock value={wp.tos + wp.duration} />
										</>
									)}
								</p>
								<p>{wp.heading}</p>
								<p>{wp.distance}</p>
								<p>{wp.speed}</p>
							</>
						);
					}}
				</For>
			</div>
		</div>
	);
}
