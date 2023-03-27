import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createMemo, createSignal, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CampaignContext, Map } from "../../components";
import { DataContext } from "../../components/DataProvider";
import {
	GameOverModal,
	Header,
	OverlaySidebar,
	OverlaySidebarProvider,
	Sidebar,
	StartMissionModal,
} from "./components";
import styles from "./Home.module.less";

export const Home = () => {
	const [
		state,
		{ tick, clearPackages, saveCampaignRound, notifyPackage, pause, updateDeploymentScore, updateRepairScore },
	] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);
	const [showStartMissionModal, setShowStartMissionModal] = createSignal(false);
	let inter: number;
	let longInter: number;
	let tickFinished = true;
	const intervalTimeout = createMemo(() => 1000 / (state.multiplier === 1 ? 1 : state.multiplier / 10));

	const onReset = () => {
		rpc.campaign.save({} as CampaignState).catch((err) => {
			console.error("RPC error", err); // eslint-disable-line no-console
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
		saveCampaignRound?.(dataStore);
	};

	const clientPackageCheck = () => {
		let tickValue: number | undefined = undefined;

		state.blueFaction?.packages.forEach((pkg) => {
			if (pkg.startTime <= state.timer + 21 && !pkg.notified) {
				const hasClient = pkg.flightGroups.some((fg) => {
					return fg.units.some((unit) => unit.client);
				});

				if (hasClient) {
					notifyPackage?.(pkg.id);
					pause?.();
					tickValue = pkg.startTime - state.timer;
				}
			}
		});

		return tickValue;
	};

	const interval = () => {
		if (tickFinished === true) {
			tickFinished = false;
			const tickValue = state.multiplier === 1 ? 1 : 10;

			const clientTick = clientPackageCheck();
			tick?.(clientTick ?? tickValue);

			try {
				saveCampaignRound?.(dataStore);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
			}
			tickFinished = true;
		} else {
			// eslint-disable-next-line no-console
			console.warn("tick skipped");
		}
	};

	const longInterval = () => {
		updateDeploymentScore?.();
		updateRepairScore?.();
	};

	const startInterval = () => {
		stopInterval();
		inter = window.setInterval(interval, intervalTimeout());
		longInter = window.setInterval(longInterval, 1000);
	};
	const stopInterval = () => {
		window.clearInterval(inter);
		window.clearInterval(longInter);
	};

	createEffect(() => {
		if (state.paused) {
			stopInterval();
		} else if (state.active) {
			startInterval();
		}
	});

	onCleanup(() => stopInterval());

	return (
		<OverlaySidebarProvider>
			<div class={styles.home}>
				<Header />
				<Sidebar />
				<OverlaySidebar />
				<div class={styles.content}>
					<div style={{ position: "absolute", top: 0, right: 0, left: 0, "z-index": 10000 }}>
						<Components.Button onPress={onReset}>Reset</Components.Button>
						<Components.Button onPress={onClearPackages}>Clear Packages</Components.Button>
						<Components.Button onPress={onLog}>Log State</Components.Button>
						<Components.Button onPress={onNextRound}>Next Round</Components.Button>
					</div>
					<Map />
					<StartMissionModal isOpen={showStartMissionModal()} onClose={() => setShowStartMissionModal(false)} />
					<GameOverModal />
				</div>
			</div>
		</OverlaySidebarProvider>
	);
};
