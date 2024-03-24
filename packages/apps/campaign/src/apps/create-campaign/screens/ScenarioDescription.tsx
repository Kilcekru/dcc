import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo } from "solid-js";
import { produce } from "solid-js/store";

import { scenarioList } from "../../../data";
import { useCreateCampaignStore, useSetCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./ScenarioDescription.module.less";

export const ScenarioDescription = () => {
	const store = useCreateCampaignStore();
	const setStore = useSetCreateCampaignStore();

	function onNext() {
		setStore("currentScreen", "Faction");
	}

	const scenario = createMemo(() =>
		scenarioList.find((s) => {
			return s.name === store.scenarioName;
		}),
	);

	function onPrev() {
		store.currentScreen = "Scenarios";
		setStore(
			produce((draft) => {
				draft.currentScreen = "Scenarios";
			}),
		);
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
