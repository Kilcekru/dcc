import * as Components from "@kilcekru/dcc-lib-components";
import { createSignal, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { AiSkillMap, getClientFlightGroups } from "../../../../utils";
import { GameOverModal } from "../game-over-modal";
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
				<p class={Styles.hardcore}>
					<Show when={state.hardcore}>
						<span>Hardcore - </span>
					</Show>
					AI Skill: {AiSkillMap[state.aiSkill]}
				</p>
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
			<MissionOverlay show={showOverlay()} onClose={() => setShowOverlay(false)} />
			<Show when={!showOverlay()}>
				<GameOverModal />
			</Show>
		</div>
	);
};
