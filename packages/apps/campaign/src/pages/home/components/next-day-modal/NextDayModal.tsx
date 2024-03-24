import * as Components from "@kilcekru/dcc-lib-components";
import { useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import Styles from "./NextDayModal.module.less";

export const NextDayModal = () => {
	const [state, { closeModal, resume }] = useContext(CampaignContext);

	function onConfirm() {
		closeModal?.("next day");
		resume?.();
	}
	return (
		<Components.Modal isOpen={state.openModals.has("next day")} onClose={() => onConfirm()}>
			<div class={Styles.content}>
				<p class={Styles.description}>
					<Components.Clock value={state.time} withDay />
				</p>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => onConfirm()}>Continue</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
};
