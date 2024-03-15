import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo } from "solid-js";

import { scenarioList } from "../../../data";
import { useCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./ScenarioDescription.module.less";

export const ScenarioDescription = () => {
	const store = useCreateCampaignStore();

	const scenario = createMemo(() =>
		scenarioList.find((s) => {
			return s.name === store.scenarioName;
		}),
	);

	function onNext() {
		store.currentScreen = "Faction";
	}

	function onPrev() {
		store.currentScreen = "Scenarios";
	}

	return (
		<Components.ScrollContainer>
			<div class={Styles.wrapper}>
				<h1 class={Styles.title}>{store.scenarioName}</h1>
				<h2 class={Styles.subtitle}>Dynamic Campaign</h2>
				{/* eslint-disable-next-line solid/no-innerhtml */}
				<div innerHTML={scenario()?.briefing} />
				<Components.Button onPress={onNext} large class={Styles.button}>
					Start Campaign
				</Components.Button>
				<Components.Button onPress={onPrev} large class={cnb(Styles.button, Styles["button--back"])}>
					Back
				</Components.Button>
			</div>
		</Components.ScrollContainer>
	);
};
