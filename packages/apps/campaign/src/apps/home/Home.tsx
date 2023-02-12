import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createSignal, onCleanup, useContext } from "solid-js";
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

	const onReset = () => {
		rpc.campaign.save({} as CampaignState).catch((err) => {
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
		saveCampaignRound?.(dataStore);
	};

	const clientPackageCheck = () => {
		state.blueFaction?.packages.forEach((pkg) => {
			const delay = state.multiplier === 1 ? 5 : state.multiplier / 10;
			if (pkg.startTime <= state.timer + delay && !pkg.notified) {
				const hasClient = pkg.flightGroups.some((fg) => {
					return fg.units.some((unit) => unit.client);
				});

				if (hasClient) {
					notifyPackage?.(pkg.id);
					pause?.();
				}
			}
		});
	};

	const interval = () => {
		if (state.multiplier === 1) {
			clientPackageCheck();
			tick?.(1 / 10);

			saveCampaignRound?.(dataStore);
		} else {
			const multi = state.multiplier / 10;

			Array.from({ length: multi }, () => {
				clientPackageCheck();
				tick?.(1);

				saveCampaignRound?.(dataStore);
			});
		}
	};

	const startInterval = () => (inter = window.setInterval(interval, 100));
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
				<div style={{ position: "absolute", top: 0, right: 0, left: 0, "z-index": 10000, display: "none" }}>
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
