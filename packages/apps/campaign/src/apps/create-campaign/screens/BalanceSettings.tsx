// import * as Components from "@kilcekru/dcc-lib-components";

import Styles from "./Settings.module.less";

export function BalanceSettings() {
	return (
		<div>
			<h2 class={Styles["radio-title"]}>AI Skill Level</h2>
			{/*<Components.RadioGroup id={aiSkill()} onChange={(value) => setAiSkill(value as DcsJs.AiSkill)}>
				<Components.RadioItem id="Average">{Utils.Params.AiSkillLabel["Average"]}</Components.RadioItem>
				<Components.RadioItem id="Good">{Utils.Params.AiSkillLabel["Good"]}</Components.RadioItem>
				<Components.RadioItem id="High">{Utils.Params.AiSkillLabel["High"]}</Components.RadioItem>
				<Components.RadioItem id="Excellent">{Utils.Params.AiSkillLabel["Excellent"]}</Components.RadioItem>
			</Components.RadioGroup> */}
			<h1 class={Styles.title}>How many Air to Air aircraft should the enemy have?</h1>
			<input type="range" id="vol" name="vol" min="0" max="5" />
			<p>None. I just want to flight Air to Ground</p>
			<p>Default. The enemy will have some aircrafts</p>
			<p>The more the better</p>
		</div>
	);
}
