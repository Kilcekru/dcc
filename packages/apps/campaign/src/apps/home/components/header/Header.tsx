import * as Components from "@kilcekru/dcc-lib-components";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { createSignal, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { GameOverModal } from "../game-over-modal";
import { MissionOverlay } from "../mission-overlay";
import Styles from "./Header.module.less";
import { TimerClock } from "./TimerClock";
import { Weather } from "./Weather";

export const Header = () => {
	const [state, { setMultiplier, resume }] = useContext(CampaignContext);
	const [showOverlay, setShowOverlay] = createSignal(false);

	const onShowOverlay = async () => {
		setShowOverlay(true);
		setMultiplier?.(300);
		resume?.();
	};

	return (
		<div class={Styles.header}>
			<div class={Styles["left-col"]}>
				<div>
					<h1 class={Styles.title}>{state.name}</h1>
					<p class={Styles.hardcore}>
						<Show when={state.campaignParams.hardcore}>
							<span>Hardcore - </span>
						</Show>
						<Show when={state.campaignParams.training}>
							<span>Training - </span>
						</Show>
						AI Skill: {Utils.Params.AiSkillLabel[state.campaignParams.aiSkill]}
					</p>
				</div>
				<Weather />
			</div>
			<div>
				<TimerClock />
			</div>
			<div class={Styles.buttons}>
				<Components.Tooltip text="Join a Flight Group to Start" disabled={state.hasClients}>
					<Components.Button onPress={onShowOverlay} large disabled={!state.hasClients}>
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
