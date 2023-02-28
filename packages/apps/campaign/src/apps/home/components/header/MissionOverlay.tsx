import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { cnb } from "cnbuilder";
import { useContext } from "solid-js";

import { CampaignContext, Clock } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import styles from "./MissionOverlay.module.less";

export function MissionOverlay(props: { show: boolean; onClose: () => void }) {
	const [state, { submitMissionState }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);

	const onSubmit = async () => {
		const missionState = await rpc.campaign.loadMissionState();

		if (missionState == null) {
			return;
		}

		if (missionState.time < state.timer) {
			return;
		}

		submitMissionState?.(missionState, dataStore);

		props.onClose();
	};

	const onCancel = () => {
		props.onClose();
	};
	return (
		<div class={cnb(styles["mission-overlay"], props.show && styles["mission-overlay--show"])}>
			<div class={styles.content}>
				<h1 class={styles.title}>Mission generated</h1>
				<div class={styles.clock}>
					<Clock value={state.timer} />
				</div>
				<div>
					<p>You can now start the Mission from within DCS.</p>
					<p>
						The Mission location is <strong>'Saved Games/DCS.openbeta/Missions/dcc_mission.miz'</strong>.
					</p>
					<p>After the Mission you can submit the Result with the button below.</p>
				</div>

				<div class={styles["buttons"]}>
					<Components.Button onPress={onCancel} class={styles.button} large>
						Cancel
					</Components.Button>
					<Components.Button onPress={onSubmit} class={styles.button} large>
						Submit Mission Result
					</Components.Button>
				</div>
			</div>
		</div>
	);
}
