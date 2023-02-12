import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { DataContext } from "../../components/DataProvider";
import styles from "./CreateCampaign.module.less";
import { Factions, Start } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Start");
	const [, { activate }] = useContext(CampaignContext);
	const dataStore = useContext(DataContext);

	return (
		<div class={styles["create-campaign"]}>
			<div class={styles["create-campaign__content"]}>
				<Switch fallback={<div>Not Found</div>}>
					<Match when={currentScreen() === "Start"}>
						<Start next={() => setCurrentScreen("Factions")} />
					</Match>
					<Match when={currentScreen() === "Factions"}>
						<Factions next={(blueId, redId) => activate?.(dataStore, blueId, redId)} />
					</Match>
				</Switch>
			</div>
		</div>
	);
};
