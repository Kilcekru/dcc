import * as Components from "@kilcekru/dcc-lib-components";

import Styles from "./MissionOverlay.module.less";

export function HowToStartModal(props: { isOpen: boolean; onClose: () => void }) {
	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles["help-modal"]}>
			<ol>
				<li>Open DCS</li>
				<li>Select the mission file via the "Mission" or "Multiplayer" tab</li>
				<li>
					The mission location is <br />
					<strong>'Saved Games/DCS.openbeta/Missions/dcc_mission.miz'</strong>.
				</li>
			</ol>
		</Components.Modal>
	);
}
