import { useCreateErrorToast } from "@kilcekru/dcc-lib-components";
import * as Types from "@kilcekru/dcc-shared-types";
import { createSignal, ErrorBoundary, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { scenarioList } from "../../data";
import { sendWorkerMessage } from "../../worker";
import styles from "./CreateCampaign.module.less";
import { CustomFaction, Factions, ScenarioDescription, Scenarios, Settings } from "./screens";
export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Scenarios");
	const [scenario, setScenario] = createSignal("");
	const [blueFaction, setBlueFaction] = createSignal<Types.Campaign.Faction | undefined>(undefined);
	const [redFaction, setRedFaction] = createSignal<Types.Campaign.Faction | undefined>(undefined);
	const [templateFaction, setTemplateFaction] = createSignal<Types.Campaign.Faction | undefined>(undefined);
	const [, { activate }] = useContext(CampaignContext);
	const createToast = useCreateErrorToast();

	const onActivate = async () =>
		/* aiSkill: DcsJs.AiSkill,
		hardcore: boolean,
		training: boolean,
		nightMissions: boolean,
		badWeather: boolean, */
		{
			const blue = blueFaction();
			const red = redFaction();
			if (blue == null || red == null) {
				return;
			}

			try {
				const scenarioDefinition = scenarioList.find((s) => s.name === scenario());

				if (scenarioDefinition == null) {
					throw new Error("Scenario not found");
				}

				sendWorkerMessage({
					name: "generate",
					payload: { blueFactionDefinition: blue, redFactionDefinition: red, scenario: scenarioDefinition },
				});

				sendWorkerMessage({
					name: "resume",
					payload: { multiplier: 1 },
				});
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
				createToast({
					title: "Campaign not created",
					description: e instanceof Error ? e.message : "Unknown Error",
				});
			}

			try {
				activate?.();
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
	const onCustomFactionNext = (faction: Types.Campaign.Faction) => {
		if (blueFaction() == null) {
			setBlueFaction(faction);
			setCurrentScreen("Red Faction");
		} else {
			setRedFaction(faction);
			setCurrentScreen("Settings");
		}
	};

	const onSelectScenario = (scenario: Types.Campaign.Scenario) => {
		setScenario(scenario.name);
		setCurrentScreen("Start");
	};

	const onCustomFaction = (template?: Types.Campaign.Faction) => {
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
