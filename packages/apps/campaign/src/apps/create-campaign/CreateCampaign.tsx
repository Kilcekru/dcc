import type * as DcsJs from "@foxdelta2/dcsjs";
import { useCreateErrorToast } from "@kilcekru/dcc-lib-components";
import { createSignal, ErrorBoundary, Match, Switch, useContext } from "solid-js";

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
	const [blueFaction, setBlueFaction] = createSignal<DcsJs.Faction | undefined>(undefined);
	const [redFaction, setRedFaction] = createSignal<DcsJs.Faction | undefined>(undefined);
	const [templateFaction, setTemplateFaction] = createSignal<DcsJs.Faction | undefined>(undefined);
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useDataStore();
	const setDataMap = useSetDataMap();
	const createToast = useCreateErrorToast();

	const onActivate = (aiSkill: DcsJs.AiSkill, hardcore: boolean, nightMissions: boolean) => {
		const blue = blueFaction();
		const red = redFaction();
		if (blue == null || red == null) {
			return;
		}

		try {
			activate?.(dataStore, blue, red, aiSkill, hardcore, nightMissions, scenario());
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			createToast({
				title: "Campaign not created",
				description: e instanceof Error ? e.message : "Unknown Error",
			});
		}
	};

	const customFactionPrev = () => {
		if (blueFaction() == null) {
			setCurrentScreen("Blue Faction");
		} else {
			setCurrentScreen("Red Faction");
		}
	};
	const onCustomFactionNext = (faction: DcsJs.Faction) => {
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

	const onCustomFaction = (template?: DcsJs.Faction) => {
		if (template != null) {
			setTemplateFaction(template);
		} else {
			setTemplateFaction(undefined);
		}

		setCurrentScreen("Custom Faction");
	};
	return (
		<ErrorBoundary fallback={<div>Something went wrong during campaign creation</div>}>
			<div class={styles["create-campaign"]}>
				<div class={styles["create-campaign__content"]}>
					<Switch fallback={<div>Not Found</div>}>
						<Match when={currentScreen() === "Scenarios"}>
							<Scenarios next={onSelectScenario} />
						</Match>
						<Match when={currentScreen() === "Start"}>
							<ScenarioDescription
								scenarioName={scenario()}
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
								prev={() => setCurrentScreen("Start")}
								customFaction={onCustomFaction}
								coalition="blue"
							/>
						</Match>
						<Match when={currentScreen() === "Red Faction"}>
							<Factions
								next={(faction) => {
									setRedFaction(faction);
									setCurrentScreen("Settings");
								}}
								prev={() => {
									setBlueFaction(undefined);
									setCurrentScreen("Blue Faction");
								}}
								customFaction={onCustomFaction}
								coalition="red"
								blueCountry={blueFaction()?.countryName}
							/>
						</Match>
						<Match when={currentScreen() === "Custom Faction"}>
							<CustomFaction prev={customFactionPrev} next={onCustomFactionNext} template={templateFaction()} />
						</Match>
						<Match when={currentScreen() === "Settings"}>
							<Settings next={onActivate} prev={() => setCurrentScreen("Red Faction")} />
						</Match>
					</Switch>
				</div>
			</div>
		</ErrorBoundary>
	);
};
