import { rpc } from "@kilcekru/dcc-lib-rpc";

interface AppLauncherProps {
	onSettings: () => void;
}

export const AppLauncher = (props: AppLauncherProps) => {
	return (
		<>
			<h2>App Launcher</h2>
			<div>
				<button onClick={() => props.onSettings()}>Settings</button>
			</div>
			<div>
				<button onClick={() => rpc.misc.loadApp("campaign")}>Campaign</button>
			</div>
		</>
	);
};
