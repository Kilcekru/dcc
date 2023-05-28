import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { cnb } from "cnbuilder";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CampaignContext, Clock } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import { useSave } from "../../../../hooks";
import Styles from "./MissionOverlay.module.less";

export function MissionOverlay(props: { show: boolean; onClose: () => void }) {
	const [state, { submitMissionState, pause }] = useContext(CampaignContext);
	const [forwarding, setForwarding] = createSignal<boolean | undefined>(undefined);
	const onSave = useSave();

	const missionTime = createMemo(() => {
		return state.blueFaction?.packages.reduce((prev, pkg) => {
			const hasClients = pkg.flightGroups.some((fg) => fg.units.some((u) => u.client));

			if (hasClients) {
				if (pkg.startTime < prev) {
					return pkg.startTime;
				}
			}

			return prev;
		}, 99999999999);
	});

	const onGenerateMission = async () => {
		pause?.();
		onSave();
		setForwarding(false);

		const unwrapped = unwrap(state);

		if (unwrapped.blueFaction == null || unwrapped.redFaction == null) {
			throw "faction not found";
		}

		try {
			await rpc.campaign.generateCampaignMission(JSON.parse(JSON.stringify(unwrapped)) as DcsJs.Campaign);
		} catch (e) {
			const errorString = String(e).split("'rpc':")[1];

			if (errorString == null) {
				return;
			}

			// eslint-disable-next-line no-console
			console.error(errorString);
			createToast({
				title: "Mission Generation failed",
				description: errorString,
			});
		}
	};

	createEffect(() => {
		const missTime = missionTime();
		if (missTime != null) {
			if (state.timer >= missTime) {
				void onGenerateMission();
			} else {
				setForwarding(true);
			}
		}
	});

	const dataStore = useContext(DataContext);
	const createToast = Components.useCreateErrorToast();

	const onSubmit = async () => {
		const missionState = await rpc.campaign.loadMissionState();

		if (missionState == null) {
			createToast({
				description: "Mission Result not found",
				title: "Mission not saved",
			});
			// eslint-disable-next-line no-console
			console.error("mission result not found");
			return;
		}

		if (missionState.time < state.timer) {
			createToast({
				description: "Mission Result is in the past",
				title: "Mission not saved",
			});
			// eslint-disable-next-line no-console
			console.error("mission is in the past");
			return;
		}

		submitMissionState?.(missionState, dataStore);

		props.onClose();
	};

	const onCancel = () => {
		props.onClose();
	};

	return (
		<div class={cnb(Styles["mission-overlay"], props.show && Styles["mission-overlay--show"])}>
			<div class={Styles.content}>
				<h1 class={cnb(Styles.title, forwarding() === false ? Styles["title--show"] : null)}>Mission generated</h1>
				<div class={cnb(Styles.clock, forwarding() === true ? Styles["clock--forwarding"] : null)}>
					<Clock value={state.timer} />
				</div>
				<div class={cnb(Styles["help-text"], forwarding() === false ? Styles["help-text--show"] : null)}>
					<p>You can now start the Mission from within DCS.</p>
					<p>Make sure DCC is able to persist the mission state</p>
					<p>
						Change the following lines in the file <strong>'DCS World/Scripts/MissionScripting.lua'</strong>
					</p>
					<p>From:</p>
					<p>
						do
						<br />
						sanitizeModule('os')
						<br />
						sanitizeModule('io')
						<br />
						sanitizeModule('lfs')
						<br />
						_G['require'] = nil
						<br />
						_G['loadlib'] = nil
						<br />
						_G['package'] = nil
						<br />
						end
					</p>
					<p>To:</p>
					<p>
						do
						<br />
						sanitizeModule('os')
						<br />
						<strong>
							--sanitizeModule('io')
							<br />
							--sanitizeModule('lfs')
							<br />
						</strong>
						_G['require'] = nil
						<br />
						_G['loadlib'] = nil
						<br />
						_G['package'] = nil
						<br />
						end
					</p>
					<p>
						The Mission location is <strong>'Saved Games/DCS.openbeta/Missions/dcc_mission.miz'</strong>.
					</p>
					<p>After the Mission you can submit the Result with the button below.</p>
				</div>

				<div class={cnb(Styles["buttons"], forwarding() === false ? Styles["buttons--show"] : null)}>
					<Components.Button onPress={onCancel} class={Styles.button} large>
						Cancel
					</Components.Button>
					<Components.Button onPress={onSubmit} class={Styles.button} large>
						Submit Mission Result
					</Components.Button>
				</div>
			</div>
		</div>
	);
}
