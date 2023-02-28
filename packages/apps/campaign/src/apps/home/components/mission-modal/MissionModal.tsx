import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import style from "./MissionModal.module.less";

export const MissionModal = (props: { isOpen?: boolean; onClose: () => void }) => {
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

	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()}>
			<div class={style["mission-modal"]}>
				<h1>Mission generated</h1>
				<p>You can now start the Mission from within DCS.</p>
				<p>
					The Mission location is <strong>'Saved Games/DCS.openbeta/Missions/dcc_mission.miz'</strong>.
				</p>
				<p>After the Mission you can submit the Result with the button below.</p>
				<div class={style["button-wrapper"]}>
					<Components.Button onPress={onSubmit}>Submit Mission Result</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
};
