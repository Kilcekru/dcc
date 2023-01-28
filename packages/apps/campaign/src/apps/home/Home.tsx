import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Map } from "../../components";
import { DataContext } from "../../components/DataProvider";
import { Header, MissionModal, Sidebar, StartMissionModal } from "./components";
import styles from "./Home.module.less";

export const Home = () => {
	const [state, { tick, clearPackages, saveCampaignRound }] = useContext(CampaignContext);
	const [tickDuration, setTickDuration] = createSignal(0);
	const dataStore = useContext(DataContext);
	const [showStartMissionModal, setShowStartMissionModal] = createSignal(false);
	const [showMissionModal, setShowMissionModal] = createSignal(false);
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
		const start = performance.now();

		saveCampaignRound?.(dataStore);
		setTickDuration(performance.now() - start);
	};

	const interval = () => {
		const start = performance.now();
		if (state.multiplier === 1) {
			tick?.(1 / 10);

			saveCampaignRound?.(dataStore);
		} else {
			const multi = state.multiplier / 10;

			Array.from({ length: multi }, () => {
				tick?.(1);

				saveCampaignRound?.(dataStore);
			});
		}
		setTickDuration(performance.now() - start);
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
			<div>
				<Button onPress={onSave}>Save</Button>
				<Button onPress={onReset}>Reset</Button>
				<Button onPress={onClearPackages}>Clear Packages</Button>
				<Button onPress={onLog}>Log State</Button>
				<Button onPress={onNextRound}>Next Round</Button>
				<div>Tick: {tickDuration()}</div>

				<Map />
				<MissionModal isOpen={showMissionModal()} onClose={() => setShowMissionModal(false)} />
				<StartMissionModal isOpen={showStartMissionModal()} onClose={() => setShowStartMissionModal(false)} />
			</div>
		</div>
	);
};
