import "./Home.less";

import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Map } from "../../components";
import { TimerClock } from "../../components/TimerClock";
import { getFlightGroups } from "../../utils";
import { useCombat } from "./combat";
import { Sidebar, StartMissionModal } from "./components";
import { usePackagesTick } from "./packages";

export const Home = () => {
	const [state, { tick, cleanupPackages, clearPackages, updateAircraftState }] = useContext(CampaignContext);
	const redPackagesTick = usePackagesTick("red");
	const bluePackagesTick = usePackagesTick("blue");
	const combat = useCombat();
	const [showModal, setShowModal] = createSignal(false);
	let inter: number;
	const modalShown: Record<number, boolean> = {};

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

	const missionModal = () => {
		const fgs = getFlightGroups(state.blueFaction?.packages);

		fgs.forEach((fg) => {
			if (Math.floor(fg.startTime) === Math.floor(state.timer) && modalShown[state.timer] == null) {
				modalShown[state.timer] = true;
				// pause?.();
				// setShowModal(true);
			}
		});
	};

	const campaignRound = () => {
		cleanupPackages?.();
		updateAircraftState?.();
		bluePackagesTick();
		redPackagesTick();
		missionModal();
		combat();
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
				<StartMissionModal isOpen={showModal()} onClose={() => setShowModal(false)} />
			</div>
		</div>
	);
};
