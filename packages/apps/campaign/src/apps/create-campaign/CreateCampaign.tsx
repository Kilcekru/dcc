import * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { DataContext } from "../../components/DataProvider";
import styles from "./CreateCampaign.module.less";
import { Factions, ScenarioDescription, Scenarios, Settings } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Scenarios");
	const [factions, setFactions] = createSignal<[string, string]>(["", ""]);
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);

	const onActivate = (aiSkill: DcsJs.AiSkill, hardcore: boolean) => {
		activate?.(dataStore, factions()[0], factions()[1], aiSkill, hardcore);
	};

	return (
		<div class={styles["create-campaign"]}>
			<div class={styles["create-campaign__content"]}>
				<Switch fallback={<div>Not Found</div>}>
					<Match when={currentScreen() === "Scenarios"}>
						<Scenarios next={() => setCurrentScreen("Start")} />
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
