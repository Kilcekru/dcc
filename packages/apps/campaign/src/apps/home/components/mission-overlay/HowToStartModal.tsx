import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createEffect, createSignal } from "solid-js";

import Styles from "./MissionOverlay.module.less";

export function HowToStartModal(props: { isOpen: boolean; onClose: () => void }) {
	const [missionLocation, setMissionLocation] = createSignal("");

	createEffect(() => {
		const getConfig = async () => {
			const config = await rpc.misc.getUserConfig();

			if (config.dcs?.available) {
				setMissionLocation(config.dcs.paths.savedGames + "\\Missions\\dcc_mission.miz");
			} else if (config.downloadsPath != null) {
				setMissionLocation(config.downloadsPath + "\\dcc_mission.miz");
			}
		};

		void getConfig();
	});

	return (
		<Components.Modal isOpen={props.isOpen} onClose={() => props.onClose()} class={Styles["help-modal"]}>
			<ol>
				<li>Open DCS</li>
				<li>Select the mission file via the "Mission" or "Multiplayer" tab</li>
				<li>
					The mission location is <br />
					<strong>'{missionLocation()}'</strong>.
				</li>
			</ol>
		</Components.Modal>
	);
}
