import { createSignal, Match, Switch } from "solid-js";

import { Factions, Start } from "./screens";

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Start");

	return (
		<div>
			<Switch fallback={<div>Not Found</div>}>
				<Match when={currentScreen() === "Start"}>
					<Start next={() => setCurrentScreen("Factions")} />
				</Match>
				<Match when={currentScreen() === "Factions"}>
					<Factions next={() => null} />
				</Match>
			</Switch>
		</div>
	);
};
