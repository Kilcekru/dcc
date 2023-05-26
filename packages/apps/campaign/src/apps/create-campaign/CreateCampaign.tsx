import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { DataContext } from "../../components/DataProvider";
import styles from "./CreateCampaign.module.less";
import { Factions, ScenarioDescription, Scenarios } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Scenarios");
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);

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
							next={(blueId, redId) => activate?.(dataStore, blueId, redId)}
							prev={() => setCurrentScreen("Start")}
						/>
					</Match>
				</Switch>
			</div>
		</div>
	);
};
