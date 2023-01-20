import "./MissionModal.less";

import { createSignal, useContext } from "solid-js";

import { Button, CampaignContext, Modal, TextField } from "../../../../components";
import { MissionState } from "../../../../types";

export const MissionModal = (props: { isOpen?: boolean; onClose: () => void }) => {
	const [state, { submitMissionState }] = useContext(CampaignContext);
	const [stateInput, setStateInput] = createSignal("");

	const onSubmit = () => {
		const missionState: MissionState = JSON.parse(stateInput()) as MissionState;

		if (missionState.time > state.timer) {
			submitMissionState?.(missionState);

			props.onClose();
		}
	};

	return (
		<Modal isOpen={props.isOpen} onClose={() => props.onClose()}>
			<div class="mission-modal">
				<div>Mission generated</div>
				<TextField value={stateInput()} onChange={setStateInput} />
				<Button onPress={onSubmit}>Submit Mission State</Button>
			</div>
		</Modal>
	);
};
