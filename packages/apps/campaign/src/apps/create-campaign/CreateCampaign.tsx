import { createSignal, Match, Switch } from "solid-js";

import { useGenerateCampaign } from "./hooks";
import { Factions, Start } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Start");

	const generateCampaign = useGenerateCampaign();

	return (
		<div>
			<Switch fallback={<div>Not Found</div>}>
				<Match when={currentScreen() === "Start"}>
					<Start next={() => setCurrentScreen("Factions")} />
				</Match>
				<Match when={currentScreen() === "Factions"}>
					<Factions next={(blueId, redId) => generateCampaign(blueId, redId)} />
				</Match>
			</Switch>
		</div>
	);
};
