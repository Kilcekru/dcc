import * as Components from "@kilcekru/dcc-lib-components";
import { createSignal, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { getClientFlightGroups } from "../../../../utils";
import { MissionOverlay } from "../mission-overlay";
import Styles from "./Header.module.less";
import { TimerClock } from "./TimerClock";

export const Header = () => {
	const [state, { setMultiplier, resume }] = useContext(CampaignContext);
	const [showOverlay, setShowOverlay] = createSignal(false);

	const onShowOverlay = async () => {
		setShowOverlay(true);
		setMultiplier?.(300);
		resume?.();
	};

	const hasClientFlightGroup = () => {
		const clientFlightGroups = getClientFlightGroups(state.blueFaction?.packages);

		return clientFlightGroups.length > 0;
	};

	return (
		<div class={Styles.header}>
			<div>
				<h1 class={Styles.title}>{state.name}</h1>
				<Show when={state.hardcore}>
					<p class={Styles.hardcore}>Hardcore</p>
				</Show>
			</div>
			<div>
				<TimerClock />
			</div>
			<div class={Styles.buttons}>
				<Components.Tooltip text="Join a Flight Group to Start" disabled={hasClientFlightGroup()}>
					<Components.Button onPress={onShowOverlay} large disabled={!hasClientFlightGroup()}>
						Takeoff
					</Components.Button>
				</Components.Tooltip>
			</div>
			<Show when={showOverlay()}>
				<MissionOverlay show={showOverlay()} onClose={() => setShowOverlay(false)} />
			</Show>
		</div>
	);
};
