import * as Components from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { cnb } from "cnbuilder";
import { For, Show } from "solid-js";

import { scenarioList } from "../../../data";
import { useCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./Scenarios.module.less";

const ScenarioItem = (props: {
	scenario: Types.Campaign.Scenario;
	onPress: (name: Types.Campaign.Scenario) => void;
}) => {
	const scenarioImage = () => {
		switch (props.scenario.id) {
			case "red-bullet":
				return Styles["red-bullet"];
			case "road-to-paris":
				return Styles["road-to-paris"];
			case "operation-northern-shield":
				return Styles["operation-northern-shield"];
			default:
				return;
		}
	};

	const mapName = () => {
		switch (props.scenario.theatre) {
			case "Caucasus":
				return "Caucasus";
			case "Normandy":
				return "Normandy";
			case "Syria":
				return "Syria";
			default:
				return "";
		}
	};

	return (
		<Components.Card
			class={Styles.scenario}
			disabled={!props.scenario.available}
			onPress={() => (props.scenario.available ? props.onPress(props.scenario) : null)}
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
export const Scenarios = () => {
	const store = useCreateCampaignStore();
	const onPress = (scenario: Types.Campaign.Scenario) => {
		store.scenarioName = scenario.name;
		store.currentScreen = "Description";
	};
	return (
		<div class={Styles.wrapper}>
			<h1 class={Styles.title}>Select a Scenario</h1>
			<Components.ScrollContainer>
				<div class={Styles.list}>
					<For each={scenarioList} fallback={<div>Loading...</div>}>
						{(scenario) => <ScenarioItem scenario={scenario} onPress={() => onPress(scenario)} />}
					</For>
				</div>
			</Components.ScrollContainer>
		</div>
	);
};
