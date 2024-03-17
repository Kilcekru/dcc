import * as Components from "@kilcekru/dcc-lib-components";

import { useCreateCampaignStore } from "../CreateCampaignContext";
import Styles from "./Settings.module.less";

export const Settings = () => {
	const store = useCreateCampaignStore();

	function onNext() {
		store.currentScreen = "Balance Settings";
	}

	function onPrev() {
		store.currentScreen = "Enemy Faction";
	}

	return (
		<div>
			<Components.Button large unstyled class={Styles["back-button"]} onPress={onPrev}>
				<Components.Icons.ArrowBack />
			</Components.Button>

			<h1 class={Styles.title}>Customize your Campaign</h1>
			<Components.Switch checked={store.hardcore} onChange={(value) => (store.hardcore = value)}>
				Hardcore
			</Components.Switch>
			<p class={Styles["hardcore-description"]}>You have one life. When you die the campaign is over</p>
			<Components.Switch
				checked={store.nightMissions}
				onChange={(value) => (store.nightMissions = value)}
				class={Styles["switch"]}
			>
				Allow Night Missions
			</Components.Switch>
			<Components.Switch
				checked={store.badWeather}
				onChange={(value) => (store.badWeather = value)}
				class={Styles["switch"]}
			>
				Allow Bad Weather
			</Components.Switch>

			<div class={Styles.buttons}>
				<Components.Button large onPress={onNext}>
					Next
				</Components.Button>
			</div>
		</div>
	);
};
