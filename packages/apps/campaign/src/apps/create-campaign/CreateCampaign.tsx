import * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { useDataStore, useSetDataMap } from "../../components/DataProvider";
import { Scenario } from "../../data";
import styles from "./CreateCampaign.module.less";
import { CustomFaction, Factions, ScenarioDescription, Scenarios, Settings } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Scenarios");
	const [scenario, setScenario] = createSignal("");
	const [blueFaction, setBlueFaction] = createSignal<DcsJs.FactionDefinition | undefined>(undefined);
	const [redFaction, setRedFaction] = createSignal<DcsJs.FactionDefinition | undefined>(undefined);
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useDataStore();
	const setDataMap = useSetDataMap();

	const onActivate = (aiSkill: DcsJs.AiSkill, hardcore: boolean) => {
		const blue = blueFaction();
		const red = redFaction();
		if (blue == null || red == null) {
			return;
		}

		activate?.(dataStore, blue, red, aiSkill, hardcore, scenario());
	};

	const customFactionPrev = () => {
		if (blueFaction() == null) {
			setCurrentScreen("Blue Faction");
		} else {
			setCurrentScreen("Red Faction");
		}
	};
	const onCustomFactionNext = (faction: DcsJs.FactionDefinition) => {
		if (blueFaction() == null) {
			setBlueFaction(faction);
			setCurrentScreen("Red Faction");
		} else {
			setRedFaction(faction);
			setCurrentScreen("Settings");
		}
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
						<ScenarioDescription
							next={() => setCurrentScreen("Blue Faction")}
							prev={() => setCurrentScreen("Scenarios")}
						/>
					</Match>
					<Match when={currentScreen() === "Blue Faction"}>
						<Factions
							next={(faction) => {
								setBlueFaction(faction);
								setCurrentScreen("Red Faction");
							}}
							prev={() => setCurrentScreen("Blue Faction")}
							customFaction={() => setCurrentScreen("Custom Faction")}
							coalition="blue"
						/>
					</Match>
					<Match when={currentScreen() === "Red Faction"}>
						<Factions
							next={(faction) => {
								setRedFaction(faction);
								setCurrentScreen("Settings");
							}}
							prev={() => setCurrentScreen("Start")}
							customFaction={() => setCurrentScreen("Custom Faction")}
							coalition="red"
						/>
					</Match>
					<Match when={currentScreen() === "Custom Faction"}>
						<CustomFaction prev={customFactionPrev} next={onCustomFactionNext} />
					</Match>
					<Match when={currentScreen() === "Settings"}>
						<Settings next={onActivate} prev={() => setCurrentScreen("Red Faction")} />
					</Match>
				</Switch>
			</div>
		</div>
	);
};
