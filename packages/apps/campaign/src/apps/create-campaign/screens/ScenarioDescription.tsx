import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo } from "solid-js";

import { scenarioList } from "../../../data";
import Styles from "./ScenarioDescription.module.less";

export const ScenarioDescription = (props: { scenarioName: string; next: () => void; prev: () => void }) => {
	const scenario = createMemo(() =>
		scenarioList.find((s) => {
			return s.name === props.scenarioName;
		}),
	);

	return (
		<Components.ScrollContainer>
			<div class={Styles.wrapper}>
				<h1 class={Styles.title}>{props.scenarioName}</h1>
				<h2 class={Styles.subtitle}>Dynamic Campaign</h2>
				{ /* eslint-disable-next-line solid/no-innerhtml */ }
				<div innerHTML={scenario()?.briefing} />
				<Components.Button onPress={() => props.next()} large class={Styles.button}>
					Start Campaign
				</Components.Button>
				<Components.Button onPress={() => props.prev()} large class={cnb(Styles.button, Styles["button--back"])}>
					Back
				</Components.Button>
			</div>
		</Components.ScrollContainer>
	);
};
