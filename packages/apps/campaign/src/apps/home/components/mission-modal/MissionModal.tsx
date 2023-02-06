import "./MissionModal.less";

import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";

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
			<div class="mission-modal">
				<div>Mission generated</div>
				<Components.Button onPress={onSubmit}>Submit Mission State</Components.Button>
			</div>
		</Components.Modal>
	);
};
