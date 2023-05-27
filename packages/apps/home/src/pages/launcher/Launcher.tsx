import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { cnb } from "cnbuilder";
import { For, Show } from "solid-js";

import Styles from "./Launcher.module.less";

type App = {
	name: string;
	id: string;
	available: boolean;
	description: string;
};
const AppList: Array<App> = [
	{
		name: "Dynamic Campaign",
		id: "campaign",
		available: true,
		description: "Create and fly your own Campaign",
	},
	{
		name: "Quick Mission",
		id: "mission",
		available: false,
		description: "Create your own Mission in seconds",
	},
	{
		name: "Patcher",
		id: "patcher",
		available: false,
		description: "Perform Updates and Fixes",
	},
];

const AppItem = (props: { app: App }) => {
	const appImage = () => {
		switch (props.app.id) {
			case "campaign":
				return Styles["campaign"];
			case "mission":
				return Styles["mission"];
			case "patcher":
				return Styles["patcher"];
			default:
				return;
		}
	};

	const onPress = () => {
		void rpc.misc.loadApp(props.app.id as "campaign");
	};

	return (
		<Components.ListItem onPress={() => onPress()} class={Styles.item}>
			<Components.Card class={Styles.app} disabled={!props.app.available}>
				<div class={cnb(Styles.background, appImage())} />
				<h2 class={Styles.name}>{props.app.name}</h2>
				<p class={Styles.description}>{props.app.description}</p>
				<Show when={!props.app.available}>
					<div class={Styles["coming-soon"]}>Coming Soon</div>
				</Show>
			</Components.Card>
		</Components.ListItem>
	);
};
export const Launcher = (props: { onSettings: () => void }) => {
	return (
		<div class={Styles["launcher"]}>
			<h1 class={Styles.title}>Digital Crew Chief</h1>
			<Components.List class={Styles["app-list"]}>
				<For each={AppList} fallback={<div>Loading...</div>}>
					{(app) => <AppItem app={app} />}
				</For>
			</Components.List>
			<Components.Button large unstyled class={Styles["settings-button"]} onPress={() => props.onSettings()}>
				<Components.Icons.SettingsFill />
			</Components.Button>
		</div>
	);
};
