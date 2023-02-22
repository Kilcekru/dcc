import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createMemo, createSignal, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Map } from "../../components";
import { DataContext } from "../../components/DataProvider";
import { GameOverModal, Header, MissionModal, Sidebar, StartMissionModal } from "./components";
import styles from "./Home.module.less";

export const Home = () => {
	const [state, { tick, clearPackages, saveCampaignRound, notifyPackage, pause }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);
	const [showStartMissionModal, setShowStartMissionModal] = createSignal(false);
	const [showMissionModal, setShowMissionModal] = createSignal(false);
	let inter: number;
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
		let tickValue: number | undefined = undefined
		
		state.blueFaction?.packages.forEach((pkg) => {
			if (pkg.startTime <= state.timer + 21 && !pkg.notified) {
				const hasClient = pkg.flightGroups.some((fg) => {
					return fg.units.some((unit) => unit.client);
				});

				if (hasClient) {
					notifyPackage?.(pkg.id);
					pause?.();
					tickValue = pkg.startTime - state.timer
				}
			}
		});

		return tickValue
	};

	const interval = () => {
		if (tickFinished === true) {
			tickFinished = false;
			const tickValue = state.multiplier === 1 ? 1 : 10;

			const clientTick = clientPackageCheck();
			tick?.(clientTick ?? tickValue);

			saveCampaignRound?.(dataStore);
			tickFinished = true;
		} else {
			// eslint-disable-next-line no-console
			console.warn("tick skipped");
		}
	};

	const startInterval = () => {
		window.clearInterval(inter);
		inter = window.setInterval(interval, intervalTimeout());
	};
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
		<div class={styles.home}>
			<Header showMissionModal={() => setShowMissionModal(true)} />
			<Sidebar />
			<div class={styles.content}>
				<div style={{ position: "absolute", top: 0, right: 0, left: 0, "z-index": 10000 }}>
					<Button onPress={onReset}>Reset</Button>
					<Button onPress={onClearPackages}>Clear Packages</Button>
					<Button onPress={onLog}>Log State</Button>
					<Button onPress={onNextRound}>Next Round</Button>
				</div>
				<Map />
				<MissionModal isOpen={showMissionModal()} onClose={() => setShowMissionModal(false)} />
				<StartMissionModal isOpen={showStartMissionModal()} onClose={() => setShowStartMissionModal(false)} />
				<GameOverModal />
			</div>
		</div>
	);
};
