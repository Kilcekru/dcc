import "./Home.less";

import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignAircraft, CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Map } from "../../components";
import { TimerClock } from "../../components/TimerClock";
import { getActiveWaypoint, getAircraftFromId, getFlightGroups, Minutes, random } from "../../utils";
import { Sidebar } from "./components";
import { usePackagesTick } from "./packages";

export const Home = () => {
	const [state, { tick, cleanupPackages, clearPackages, updateAircraftState, destroyUnit, updateActiveAircrafts }] =
		useContext(CampaignContext);
	const redPackagesTick = usePackagesTick("red");
	const bluePackagesTick = usePackagesTick("blue");
	let inter: number;

	const onSave = () => {
		rpc.campaign
			.save(JSON.parse(JSON.stringify(state)) as CampaignState)
			.then((result) => {
				console.log("save", result); // eslint-disable-line no-console
			})
			.catch((err) => {
				console.log("RPC error", err); // eslint-disable-line no-console
			});
	};

	const onReset = () => {
		rpc.campaign
			.save({} as CampaignState)
			.then((result) => {
				console.log("save", result); // eslint-disable-line no-console
			})
			.catch((err) => {
				console.log("RPC error", err); // eslint-disable-line no-console
			});
	};

	const onLog = () => {
		console.log(unwrap(state)); // eslint-disable-line no-console
	};

	const onClearPackages = () => {
		clearPackages?.("blueFaction");
		clearPackages?.("redFaction");
	};

	const onNextRound = () => {
		campaignRound();
	};

	const casAttack = () => {
		const fgs = getFlightGroups(state.blueFaction?.packages);

		const onStationCASfgs = fgs.filter((fg) => fg.task === "CAS" && getActiveWaypoint(fg, state.timer)?.name === "CAS");

		const updatedAircraft: Array<CampaignAircraft> = [];

		onStationCASfgs.forEach((fg) => {
			fg.aircraftIds.forEach((id) => {
				const aircraft = getAircraftFromId(state.blueFaction?.inventory.aircrafts, id);

				if (aircraft == null) {
					throw "aircraft not found";
				}

				// Init arrival
				if (aircraft.weaponReadyTimer == null) {
					updatedAircraft.push({ ...aircraft, weaponReadyTimer: state.timer + Minutes(3) });
				} else if (aircraft.weaponReadyTimer <= state.timer) {
					const fgObjective = state.objectives.find((obj) => fg.objective?.name === obj.name);

					if (fgObjective == null) {
						throw "objective not found";
					}

					const aliveUnits = fgObjective.units.find((unit) => unit.alive === true);

					if (aliveUnits != null) {
						// Is the attack successful
						if (random(1, 100) <= 50) {
							destroyUnit?.("red", fgObjective.name, aliveUnits.id);
							console.log(`CAS: ${aircraft.id} destroyed ${aliveUnits.id} in objective ${fgObjective.name}`); // eslint-disable-line no-console
						} else {
							console.log(`CAS: ${aircraft.id} missed ${aliveUnits.id} in objective ${fgObjective.name}`); // eslint-disable-line no-console
						}

						updatedAircraft.push({ ...aircraft, weaponReadyTimer: state.timer + Minutes(3) });
					}
				}
			});
		});

		if (updatedAircraft.length > 0) {
			updateActiveAircrafts?.("blueFaction", updatedAircraft);
		}
	};

	const campaignRound = () => {
		cleanupPackages?.();
		updateAircraftState?.();
		casAttack();
		bluePackagesTick();
		redPackagesTick();
	};

	const interval = () => {
		if (state.multiplier === 1) {
			tick?.(1 / 60);

			campaignRound();
		} else {
			const multi = state.multiplier / 60;

			Array.from({ length: multi }, () => {
				tick?.(1);

				campaignRound();
			});
		}
	};

	const startInterval = () => (inter = window.setInterval(interval, 16));
	const stopInterval = () => window.clearInterval(inter);

	createEffect(() => {
		if (state.paused) {
			stopInterval();
		} else if (state.active) {
			startInterval();
		}
	});

	onCleanup(() => stopInterval());

	return (
		<div class="home">
			<Sidebar />
			<div>
				<h1>
					{state.blueFaction?.name} vs {state.redFaction?.name}
				</h1>
				<Button onPress={onSave}>Save</Button>
				<Button onPress={onReset}>Reset</Button>
				<Button onPress={onClearPackages}>Clear Packages</Button>
				<Button onPress={onLog}>Log State</Button>
				<Button onPress={onNextRound}>Next Round</Button>
				<TimerClock />
				<Map />
			</div>
		</div>
	);
};
