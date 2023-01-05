import "./StartMissionModal.less";

import { Button, Modal } from "../../../../components";

export const StartMissionModal = (props: { isOpen?: boolean; onClose: () => void }) => {
	return (
		<Modal isOpen={props.isOpen} onClose={() => props.onClose()}>
			<div class="start-mission-modal">
				<div>Start Mission</div>
				<Button>Generate</Button>
			</div>
		</Modal>
	);
};
