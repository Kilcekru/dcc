import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createSignal } from "solid-js";

import { AiSkillMap } from "../../../utils";
import Styles from "./Settings.module.less";

export const Settings = (props: {
	next: (
		aiSkill: DcsJs.AiSkill,
		hardcore: boolean,
		training: boolean,
		nightMissions: boolean,
		badWeather: boolean,
	) => void;
	prev: () => void;
}) => {
	const [hardcore, setHardcore] = createSignal(false);
	const [nightMissions, setNightMissions] = createSignal(false);
	const [badWeather, setBadWeather] = createSignal(true);
	const [training, setTraining] = createSignal(false);
	const [aiSkill, setAiSkill] = createSignal<DcsJs.AiSkill>("Average");
	return (
		<div>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={() => props.prev()}>
				<Components.Icons.ArrowBack />
			</Components.Button>

			<h1 class={Styles.title}>Customize your Campaign</h1>
			<Components.Switch checked={hardcore()} onChange={(value) => setHardcore(value)}>
				Hardcore
			</Components.Switch>
			<p class={Styles["hardcore-description"]}>You have one life. When you die the campaign is over</p>
			<Components.Switch checked={training()} onChange={(value) => setTraining(value)}>
				Trainings Mode
			</Components.Switch>
			<p class={Styles["hardcore-description"]}>
				The AI(Air and Ground) will not engage in combat during the DCS Mission
			</p>
			<Components.Switch
				checked={nightMissions()}
				onChange={(value) => setNightMissions(value)}
				class={Styles["switch"]}
			>
				Allow Night Missions
			</Components.Switch>
			<Components.Switch checked={badWeather()} onChange={(value) => setBadWeather(value)} class={Styles["switch"]}>
				Allow Bad Weather
			</Components.Switch>
			<h2 class={Styles["radio-title"]}>AI Skill Level</h2>
			<Components.RadioGroup id={aiSkill()} onChange={(value) => setAiSkill(value as DcsJs.AiSkill)}>
				<Components.RadioItem id="Average">{AiSkillMap["Average"]}</Components.RadioItem>
				<Components.RadioItem id="Good">{AiSkillMap["Good"]}</Components.RadioItem>
				<Components.RadioItem id="High">{AiSkillMap["High"]}</Components.RadioItem>
				<Components.RadioItem id="Excellent">{AiSkillMap["Excellent"]}</Components.RadioItem>
			</Components.RadioGroup>

			<div class={Styles.buttons}>
				<Components.Button
					large
					onPress={() => props.next(aiSkill(), hardcore(), training(), nightMissions(), badWeather())}
				>
					Next
				</Components.Button>
			</div>
		</div>
	);
};
