import "./Home.less";

import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, For, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Clock, Map } from "../../components";
import { TimerClock } from "../../components/TimerClock";
import { generateCAPPackage, generateCASPackage } from "../../generatePackage";
import { Sidebar } from "./components";

export const Home = () => {
	const [state, { addPackage, tick, cleanupPackages, clearPackages }] = useContext(CampaignContext);
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
		clearPackages?.();
	};

	const onNextRound = () => {
		campaignRound();
	};

	const cas = () => {
		const runningCASPackages = state.blueFaction?.packages.filter((pkg) => {
			return pkg.task === "CAS";
		});
		const runningCASPackagesCount = runningCASPackages?.length ?? 0;

		if (runningCASPackagesCount < 1) {
			const pkg = generateCASPackage(state.blueFaction?.activeAircrafts, state.redFaction?.objectives, state.timer);

			addPackage?.(pkg);
		}
	};

	const cap = () => {
		const runningCAPPackages = state.blueFaction?.packages.filter((pkg) => {
			return pkg.task === "CAP";
		});
		const runningCAPPackagesCount = runningCAPPackages?.length ?? 0;

		if (runningCAPPackagesCount < 1) {
			const pkg = generateCAPPackage(state.blueFaction?.activeAircrafts, state.timer);

			addPackage?.(pkg);
		}
	};

	const campaignRound = () => {
		cleanupPackages?.();

		cas();
		cap();
	};
	const interval = () => {
		tick?.();

		campaignRound();
	};

	const startInterval = () => (inter = window.setInterval(interval, 1000));
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
				Blue Packages: {state.blueFaction?.packages.length}
				<TimerClock />
				<Map />
				<div>
					<h3>Packages</h3>
					<For each={state.blueFaction?.packages}>
						{(pkg) => (
							<div>
								{pkg.id} - {pkg.task}
								<h4>Flight Groups</h4>
								<For each={pkg.flightGroups}>
									{(fg) => (
										<div>
											-{fg.name}
											<For each={fg.waypoints}>
												{(waypoint) => (
													<div>
														--{waypoint.name} <Clock value={waypoint.time} />
													</div>
												)}
											</For>
											<For each={fg.aircraftIds}>{(id) => <div>--{id}</div>}</For>
										</div>
									)}
								</For>
							</div>
						)}
					</For>
					<h3>Aircrafts</h3>
					<For each={state.blueFaction?.activeAircrafts}>
						{(aircraft) => (
							<div>
								{aircraft.id} - {aircraft.aircraftType} - {aircraft.state}
							</div>
						)}
					</For>
				</div>
			</div>
		</div>
	);
};
