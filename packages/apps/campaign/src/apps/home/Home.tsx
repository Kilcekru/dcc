import "./Home.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { Button, CampaignContext, Map } from "../../components";
import { TimerClock } from "../../components/TimerClock";
import { getFlightGroups } from "../../utils";
import { useCombat } from "./combat";
import { MissionModal, Sidebar, StartMissionModal } from "./components";
import { usePackagesTick } from "./packages";

export const Home = () => {
	const [state, { tick, cleanupPackages, clearPackages, updateAircraftState, pause }] = useContext(CampaignContext);
	const redPackagesTick = usePackagesTick("red");
	const bluePackagesTick = usePackagesTick("blue");
	const combat = useCombat();
	const [showStartMissionModal, setShowStartMissionModal] = createSignal(false);
	const [showMissionModal, setShowMissionModal] = createSignal(false);
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

	const onNextRound = async () => {
		await campaignRound();
	};

	const onGenerateMission = async () => {
		pause?.();

		const unwrapped = unwrap(state);

		if (unwrapped.blueFaction == null || unwrapped.redFaction == null) {
			throw "faction not found";
		}

		const campaign: DcsJs.Campaign = unwrapped as DcsJs.Campaign;

		await rpc.campaign.generateCampaignMission(campaign);

		setShowMissionModal(true);
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

	const campaignRound = async () => {
		cleanupPackages?.();
		updateAircraftState?.();
		await bluePackagesTick();
		await redPackagesTick();
		missionModal();
		combat();
	};

	const interval = async () => {
		if (state.multiplier === 1) {
			tick?.(1 / 60);

			await campaignRound();
		} else {
			const multi = state.multiplier / 60;

			Array.from({ length: multi }, async () => {
				tick?.(1);

				await campaignRound();
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
				<Button onPress={onGenerateMission}>Generate Mission</Button>
				<TimerClock />
				<Map />
				<MissionModal isOpen={showMissionModal()} onClose={() => setShowMissionModal(false)} />
				<StartMissionModal isOpen={showStartMissionModal()} onClose={() => setShowStartMissionModal(false)} />
			</div>
		</div>
	);
};
