import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { createSignal } from "solid-js";

import { AiSkillMap } from "../../../utils";
import Styles from "./Settings.module.less";

export const Settings = (props: { next: (aiSkill: DcsJs.AiSkill, hardcore: boolean) => void; prev: () => void }) => {
	const [hardcore, setHardcore] = createSignal(false);
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
			<h2 class={Styles["radio-title"]}>AI Skill Level</h2>
			<Components.RadioGroup id={aiSkill()} onChange={(value) => setAiSkill(value as DcsJs.AiSkill)}>
				<Components.RadioItem id="Average">{AiSkillMap["Average"]}</Components.RadioItem>
				<Components.RadioItem id="Good">{AiSkillMap["Good"]}</Components.RadioItem>
				<Components.RadioItem id="High">{AiSkillMap["High"]}</Components.RadioItem>
				<Components.RadioItem id="Excellent">{AiSkillMap["Excellent"]}</Components.RadioItem>
			</Components.RadioGroup>

			<div class={Styles.buttons}>
				<Components.Button large onPress={() => props.next(aiSkill(), hardcore())}>
					Next
				</Components.Button>
			</div>
		</div>
	);
};
