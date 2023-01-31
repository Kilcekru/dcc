import "./index.less";

import { rpc } from "@kilcekru/dcc-lib-rpc";
import { DcsPaths, UserConfig } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, Match, Switch } from "solid-js";
import { render } from "solid-js/web";

import { AppLauncher } from "./pages/appLauncher";
import { DcsPathSelector } from "./pages/dcsPaths";
import { SetupComplete } from "./pages/setupComplete";

const App = () => {
	const [error, setError] = createSignal<Error>();
	const [action, setAction] = createSignal<"settings">();
	const [userConfig, setUserConfig] = createSignal<Partial<UserConfig>>();

	const loadUserConfig = async () => {
		try {
			const config = await rpc.misc.getUserConfig();
			setUserConfig(config);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`getUserConfig failed: ${msg}`));
		}
	};
	void loadUserConfig();

	const getUserDcsPaths = () => {
		const cfg = userConfig();
		return cfg?.dcs?.available ? cfg.dcs.paths : undefined;
	};

	const onSetupComplete = async () => {
		try {
			await rpc.launcher.setSetupComplete();
			await loadUserConfig();
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`onSetupComplete failed: ${msg}`));
		}
	};

	const onSelectDscPaths = async (paths?: DcsPaths) => {
		try {
			if (paths != undefined) {
				await rpc.launcher.setDcsPaths(paths);
			} else {
				await rpc.launcher.setDcsNotAvailable();
			}
			await loadUserConfig();
			setAction(undefined);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Unknown error";
			setError(new Error(`onSelectDscPaths failed: ${msg}`));
		}
	};

	return (
		<>
			<Switch fallback={<AppLauncher onSettings={() => setAction("settings")} />}>
				<Match when={error() != undefined}>
					<div>Render error: {error()?.message}</div>
				</Match>
				<Match when={!userConfig()?.setupComplete}>
					<SetupComplete onContinue={onSetupComplete} />
				</Match>
				<Match when={userConfig()?.dcs == undefined || action() === "settings"}>
					<DcsPathSelector paths={getUserDcsPaths()} onSelect={onSelectDscPaths} />
				</Match>
			</Switch>
		</>
	);
};

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
	render(() => <App />, rootElement);
} else {
	console.error("Missing root element"); // eslint-disable-line no-console
}
