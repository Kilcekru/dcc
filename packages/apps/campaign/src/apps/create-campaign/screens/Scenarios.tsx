import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { For, Show } from "solid-js";

import { Scenario, scenarioList } from "../../../data";
import Styles from "./Scenarios.module.less";

const ScenarioItem = (props: { scenario: Scenario; onPress: (name: Scenario) => void }) => {
	const scenarioImage = () => {
		switch (props.scenario.id) {
			case "red-bullet":
				return Styles["red-bullet"];
			case "road-to-paris":
				return Styles["road-to-paris"];
			case "desert-thunder":
				return Styles["desert-thunder"];
			default:
				return;
		}
	};

	const mapName = () => {
		switch (props.scenario.map) {
			case "caucasus":
				return "Caucasus";
			case "normandy":
				return "Normandy";
			case "syria":
				return "Syria";
			default:
				return "";
		}
	};

	return (
		<Components.Card
			class={Styles.scenario}
			disabled={!props.scenario.available}
			onPress={() => props.onPress(props.scenario)}
		>
			<div class={cnb(Styles.background, scenarioImage())} />
			<h2 class={Styles.name}>{props.scenario.name}</h2>
			<div class={Styles.stats}>
				<Components.Stat>
					<>
						<Components.StatLabel>Map</Components.StatLabel>
						<Components.StatValue>{mapName()}</Components.StatValue>
					</>
				</Components.Stat>
				<Components.Stat>
					<>
						<Components.StatLabel>Era</Components.StatLabel>
						<Components.StatValue>{props.scenario.era}</Components.StatValue>
					</>
				</Components.Stat>
			</div>
			<Show when={!props.scenario.available}>
				<div class={Styles["coming-soon"]}>Coming Soon</div>
			</Show>
		</Components.Card>
	);
};
export const Scenarios = (props: { next: (scenario: Scenario) => void }) => {
	return (
		<div class={Styles.wrapper}>
			<h1 class={Styles.title}>Select a Scenario</h1>
			<Components.ScrollContainer>
				<div class={Styles.list}>
					<For each={scenarioList} fallback={<div>Loading...</div>}>
						{(scenario) => <ScenarioItem scenario={scenario} onPress={(scenario) => props.next(scenario)} />}
					</For>
				</div>
			</Components.ScrollContainer>
		</div>
	);
};
