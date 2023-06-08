import * as Components from "@kilcekru/dcc-lib-components";
import { useContext } from "solid-js";

import { CampaignContext, Clock } from "../../../../components";
import Styles from "./NextDayModal.module.less";

export const NextDayModal = () => {
	const [state, { resumeNextDay }] = useContext(CampaignContext);

	return (
		<Components.Modal isOpen={state.nextDay} onClose={() => resumeNextDay?.()}>
			<div class={Styles.content}>
				<p class={Styles.description}>
					<Clock value={state.timer} withDay />
				</p>
				<div class={Styles.buttons}>
					<Components.Button onPress={() => resumeNextDay?.()}>Continue</Components.Button>
				</div>
			</div>
		</Components.Modal>
	);
};
