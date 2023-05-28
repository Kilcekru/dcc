import { createEffect, createMemo, onCleanup, useContext } from "solid-js";

import { CampaignContext, Map } from "../../components";
import { DataContext } from "../../components/DataProvider";
import { useSave } from "../../hooks";
import { getClientMissionStartTime } from "../../utils";
import { GameOverModal, Header, OverlaySidebar, OverlaySidebarProvider, Sidebar } from "./components";
import { ResetModal } from "./components/reset-modal";
import styles from "./Home.module.less";

export const Home = () => {
	const [state, { tick, saveCampaignRound, pause, updateDeploymentScore, updateRepairScore }] =
		useContext(CampaignContext);
	const dataStore = useContext(DataContext);
	let inter: number;
	let longInter: number;
	let tickFinished = true;
	const intervalTimeout = createMemo(() => 1000 / (state.multiplier === 1 ? 1 : state.multiplier / 10));
	const save = useSave();

	const interval = () => {
		if (tickFinished === true) {
			tickFinished = false;
			const tickValue = state.multiplier === 1 ? 1 : 10;
			const clientMissionStartTime = getClientMissionStartTime(state);

			if (clientMissionStartTime == null || state.timer < clientMissionStartTime) {
				tick?.(tickValue);

				try {
					saveCampaignRound?.(dataStore);
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e, state);
					stopInterval();
				}
			} else {
				pause?.();
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
		save();
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

	onCleanup(() => {
		stopInterval();
	});

	return (
		<OverlaySidebarProvider>
			<div class={styles.home}>
				<Header />
				<Sidebar />
				<OverlaySidebar />
				<div class={styles.content}>
					<Map />
					<GameOverModal />
				</div>
				<ResetModal />
			</div>
		</OverlaySidebarProvider>
	);
};
