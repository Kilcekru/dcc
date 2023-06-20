import * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useDataStore, useSetDataMap } from "../../components/DataProvider";
import { Scenario } from "../../data";
import styles from "./CreateCampaign.module.less";
import { Factions, ScenarioDescription, Scenarios, Settings } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Scenarios");
	const [scenario, setScenario] = createSignal("");
	const [factions, setFactions] = createSignal<[string, string]>(["", ""]);
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useDataStore();
	const setDataMap = useSetDataMap();

	const onActivate = (aiSkill: DcsJs.AiSkill, hardcore: boolean) => {
		activate?.(dataStore, factions()[0], factions()[1], aiSkill, hardcore, scenario());
	};

	const onSelectScenario = (scenario: Scenario) => {
		setScenario(scenario.name);
		setCurrentScreen("Start");
		setDataMap(scenario.map as DcsJs.MapName);
	};

	return (
		<div class={styles["create-campaign"]}>
			<div class={styles["create-campaign__content"]}>
				<Switch fallback={<div>Not Found</div>}>
					<Match when={currentScreen() === "Scenarios"}>
						<Scenarios next={onSelectScenario} />
					</Match>
					<Match when={currentScreen() === "Start"}>
						<ScenarioDescription next={() => setCurrentScreen("Factions")} prev={() => setCurrentScreen("Scenarios")} />
					</Match>
					<Match when={currentScreen() === "Factions"}>
						<Factions
							next={(blueId, redId) => {
								setFactions([blueId, redId]);
								setCurrentScreen("Settings");
							}}
							prev={() => setCurrentScreen("Start")}
						/>
					</Match>
					<Match when={currentScreen() === "Settings"}>
						<Settings next={onActivate} prev={() => setCurrentScreen("Factions")} />
					</Match>
				</Switch>
			</div>
		</div>
	);
};
