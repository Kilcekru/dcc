import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createMemo, For, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import * as Domain from "../../../../domain";
import {
	killedAircraftIdsByFlightGroups,
	killedBuildingNames,
	killedGroundUnitIds,
	killedSamNames,
} from "../../../../logic";
import Styles from "./Debrief.module.less";

function useFlightGroupMissionState(
	flightGroup: DcsJs.CampaignFlightGroup,
	killedBlueAircrafts: Array<string>,
	killedRedGroundUnits: Array<string>,
) {
	const [state] = useContext(CampaignContext);
	const clientsKilled = flightGroup.units.some(
		(unit) => unit.client && killedBlueAircrafts.some((id) => id === unit.id),
	);

	if (clientsKilled) {
		return "Killed in Action";
	}

	switch (flightGroup.task) {
		case "CAS": {
			const targetGg = state.redFaction?.groundGroups.find((gg) => gg.id === flightGroup.target);

			if (targetGg == null) {
				// eslint-disable-next-line no-console
				console.error("CAS Ground Group not found");
				return "Success";
			}

			const killedUnits = targetGg.unitIds.some((targetUnitId) =>
				killedRedGroundUnits.some((id) => targetUnitId === id),
			);

			if (killedUnits) {
				return "Success";
			} else {
				return "Incomplete";
			}
		}
		case "Escort": {
			const targetPkg = state.blueFaction?.packages.find((pkg) =>
				pkg.flightGroups.some((fg) => fg.name === flightGroup.target),
			);
			const targetFg = targetPkg?.flightGroups.find((fg) => fg.name === flightGroup.target);

			if (targetFg == null) {
				// eslint-disable-next-line no-console
				console.error("Escort Target Flight Group not found");
				return "Incomplete";
			}

			const targetKilled = targetFg.units.some((unit) => killedBlueAircrafts.some((id) => unit.id === id));

			if (targetKilled) {
				return "Incomplete";
			} else {
				return "Success";
			}
		}
		case "Pinpoint Strike": {
			const targetStructure = state.redFaction?.structures[flightGroup.target ?? ""];

			if (targetStructure == undefined) {
				// eslint-disable-next-line no-console
				console.error("Strike Target Structure not found");
				return "Success";
			}

			const buildingAlive = targetStructure.buildings.some(
				(building) => building.alive && !killedRedGroundUnits.some((name) => name === building.name),
			);

			if (buildingAlive) {
				return "Incomplete";
			} else {
				return "Success";
			}
		}
		case "DEAD": {
			const targetSam = state.redFaction?.groundGroups.find((sam) => sam.id === flightGroup.target);

			if (targetSam == null || !Domain.Faction.isSamGroup(targetSam)) {
				// eslint-disable-next-line no-console
				console.error("DEAD Target not found");
				return "Success";
			}

			if (targetSam.operational) {
				return "Incomplete";
			} else {
				return "Success";
			}
		}
		default:
			return "Success";
	}
}

function Unit(props: { unit: DcsJs.CampaignFlightGroupUnit; killedBlueAircrafts: Array<string> }) {
	const killed = createMemo(() => props.killedBlueAircrafts.some((id) => id === props.unit.id));
	return (
		<div class={Styles["aircraft-row"]}>
			<p>{props.unit.name}</p>
			<Show when={killed()} fallback={<p>Alive</p>}>
				<p>Killed in Action</p>
			</Show>
		</div>
	);
}
function FlightGroup(props: {
	flightGroup: DcsJs.CampaignFlightGroup;
	killedBlueAircrafts: Array<string>;
	killedRedGroundUnits: Array<string>;
}) {
	const fgMissionState = useFlightGroupMissionState(
		// eslint-disable-next-line solid/reactivity
		props.flightGroup,
		// eslint-disable-next-line solid/reactivity
		props.killedBlueAircrafts,
		// eslint-disable-next-line solid/reactivity
		props.killedRedGroundUnits,
	);

	return (
		<div>
			<div class={Styles["flight-group-row"]}>
				<p class={Styles["flight-group"]}>{props.flightGroup.name}</p>
				<p class={Styles["flight-group"]}>{fgMissionState}</p>
			</div>
			<For each={props.flightGroup.units}>
				{(unit) => <Unit unit={unit} killedBlueAircrafts={props.killedBlueAircrafts} />}
			</For>
		</div>
	);
}

export function Debrief(props: {
	missionState: Types.Campaign.MissionState | undefined;
	flightGroups: {
		blue: Array<DcsJs.CampaignFlightGroup>;
		red: Array<DcsJs.CampaignFlightGroup>;
	};
	onClose: () => void;
}) {
	const [state] = useContext(CampaignContext);

	const stats = createMemo(() => {
		if (state.blueFaction == null) {
			throw "blue faction not found";
		}

		if (state.redFaction == null) {
			throw "red faction not found";
		}

		const blueAircrafts = killedAircraftIdsByFlightGroups(
			props.flightGroups.blue,
			props.missionState?.killed_aircrafts ?? [],
		);
		const redAircrafts = killedAircraftIdsByFlightGroups(
			props.flightGroups.red,
			props.missionState?.killed_aircrafts ?? [],
		);

		const blueGroundUnits = killedGroundUnitIds(state.blueFaction, props.missionState?.killed_ground_units ?? [], true);
		const redGroundUnits = killedGroundUnitIds(state.redFaction, props.missionState?.killed_ground_units ?? [], true);

		const blueBuildings = killedBuildingNames(state.blueFaction, props.missionState?.killed_ground_units ?? []);
		const redBuildings = killedBuildingNames(state.redFaction, props.missionState?.killed_ground_units ?? []);

		const blueSams = killedSamNames(state.blueFaction, props.missionState?.killed_ground_units ?? []);
		const redSams = killedSamNames(state.redFaction, props.missionState?.killed_ground_units ?? []);

		return {
			aircrafts: {
				blue: blueAircrafts,
				red: redAircrafts,
			},
			groundUnits: {
				blue: blueGroundUnits,
				red: redGroundUnits,
			},
			buildings: {
				blue: blueBuildings,
				red: redBuildings,
			},
			sams: {
				blue: blueSams,
				red: redSams,
			},
		};
	});

	const clientFlightGroups = createMemo(() => {
		return props.flightGroups.blue.filter((fg) => fg.units.some((u) => u.client));
	});

	return (
		<div class={Styles.wrapper}>
			<div class={Styles.content}>
				<h1 class={Styles.title}>Debrief</h1>
				<Components.ScrollContainer>
					<h2 class={Styles.subtitle}>{props.flightGroups.blue.length > 1 ? "Flight Groups" : "Flight Group"}</h2>
					<For each={clientFlightGroups()}>
						{(fg) => (
							<FlightGroup
								flightGroup={fg}
								killedBlueAircrafts={stats().aircrafts.blue}
								killedRedGroundUnits={stats().groundUnits.red}
							/>
						)}
					</For>
					<div class={Styles.stats}>
						<div class={Styles["stats-row"]}>
							<p class={Styles.country}>{state.blueFaction?.countryName}</p>
							<div />
							<p class={Styles.country}>{state.redFaction?.countryName}</p>
						</div>

						<div class={Styles["stats-row"]}>
							<p class={Styles.stat}>{stats().aircrafts.blue.length}</p>
							<h3 class={Styles["stats-title"]}>Lost Aircrafts</h3>
							<p class={Styles.stat}>{stats().aircrafts.red.length}</p>
						</div>

						<div class={Styles["stats-row"]}>
							<p class={Styles.stat}>{stats().groundUnits.blue.length}</p>
							<h3 class={Styles["stats-title"]}>Lost Ground Units</h3>
							<p class={Styles.stat}>{stats().groundUnits.red.length}</p>
						</div>

						<div class={Styles["stats-row"]}>
							<p class={Styles.stat}>{stats().buildings.blue.length}</p>
							<h3 class={Styles["stats-title"]}>Lost Buildings</h3>
							<p class={Styles.stat}>{stats().buildings.red.length}</p>
						</div>

						<div class={Styles["stats-row"]}>
							<p class={Styles.stat}>{stats().sams.blue.length}</p>
							<h3 class={Styles["stats-title"]}>Lost SAMs</h3>
							<p class={Styles.stat}>{stats().sams.red.length}</p>
						</div>
					</div>
				</Components.ScrollContainer>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => props.onClose()} class={Styles.button} large>
						Continue
					</Components.Button>
				</div>
			</div>
		</div>
	);
}
