import { useCreateErrorToast, useCreateToast } from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import { createEffect, createMemo, ErrorBoundary, onCleanup, onMount, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CampaignContext, MapContainer } from "../../components";
import { useDataStore } from "../../components/DataProvider";
import * as Domain from "../../domain";
import { useSave } from "../../hooks";
import { calcTakeoffTime } from "../../utils";
import { Header, NextDayModal, OverlaySidebar, OverlaySidebarProvider, Sidebar } from "./components";
import styles from "./Home.module.less";

export const Home = () => {
	const [
		state,
		{
			tick,
			saveCampaignRound,
			saveLongCampaignRound,
			pause,
			updateDeploymentScore,
			updateRepairScore,
			updateWeather,
			updateDownedPilots,
			togglePause,
			clearToastMessages,
		},
	] = useContext(CampaignContext);
	const dataStore = useDataStore();
	let inter: number;
	let longInter: number;
	let tickFinished = true;
	const intervalTimeout = createMemo(() => 1000 / (state.multiplier === 1 ? 1 : state.multiplier / 10));
	const save = useSave();
	const createToast = useCreateToast();
	const createErrorToast = useCreateErrorToast();

	const interval = () => {
		if (tickFinished === true) {
			tickFinished = false;
			const tickValue = state.multiplier === 1 ? 1 : 10;
			const takeoffTime = calcTakeoffTime(state.blueFaction?.packages);

			if (takeoffTime == null || takeoffTime > state.timer) {
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
				save();
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
		updateWeather?.(dataStore);
		updateDownedPilots?.();

		try {
			saveLongCampaignRound?.(dataStore);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e, state);
			stopInterval();
		}

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

	createEffect(() => {
		const ids: Array<string> = [];
		state.toastMessages.forEach((msg) => {
			switch (msg.type) {
				case "error": {
					createErrorToast({
						description: msg.description,
						title: msg.title,
					});
					break;
				}
				default: {
					createToast({
						description: msg.description,
						title: msg.title,
					});
				}
			}
			ids.push(msg.id);
		});

		if (ids.length > 0) {
			clearToastMessages?.(ids);
		}
	});
	onCleanup(() => {
		stopInterval();
	});

	const onKeyUp = (e: KeyboardEvent) => {
		if (e.code === "Space") {
			togglePause?.();
		}
	};

	onMount(() => document.addEventListener("keyup", onKeyUp));

	onCleanup(() => document.removeEventListener("keyup", onKeyUp));

	onEvent("menu.campaign.new", () => {
		rpc.campaign.saveCampaign(unwrap(state)).catch(Domain.Utils.catchAwait);
	});

	return (
		<OverlaySidebarProvider>
			<div class={styles.home}>
				<Header />
				<Sidebar />
				<OverlaySidebar />
				<div class={styles.content}>
					<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
						<MapContainer />
					</ErrorBoundary>
				</div>
				<NextDayModal />
			</div>
		</OverlaySidebarProvider>
	);
};
