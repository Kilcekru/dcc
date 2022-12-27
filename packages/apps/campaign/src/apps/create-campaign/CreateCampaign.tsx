import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { factionList } from "../../data";
import { FactionStore } from "../../types";
import { Factions, Start } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

const generateCampaign = (blueFactionId: string, redFactionId: string) => {
	const blueBaseFaction = factionList.find((f) => f.id === blueFactionId);

	if (blueBaseFaction == null) {
		throw "unknown faction: " + blueFactionId;
	}
	const blueFaction: FactionStore = {
		...blueBaseFaction,
		airdromes: ["Kobuleti"],
		planes: ["F-16"],
	};

	const redBaseFaction = factionList.find((f) => f.id === redFactionId);

	if (redBaseFaction == null) {
		throw "unknown faction: " + blueFactionId;
	}
	const redFaction: FactionStore = {
		...redBaseFaction,
		airdromes: ["Sukhumi-Babushara"],
		planes: ["Mig-29"],
	};

	return {
		blueFaction,
		redFaction,
	};
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Start");
	const [, { activate }] = useContext(CampaignContext);

	const onFactionsNext = (blueId: string, redId: string) => {
		const factions = generateCampaign(blueId, redId);
		activate?.(factions.blueFaction, factions.redFaction);
	};

	return (
		<div>
			<Switch fallback={<div>Not Found</div>}>
				<Match when={currentScreen() === "Start"}>
					<Start next={() => setCurrentScreen("Factions")} />
				</Match>
				<Match when={currentScreen() === "Factions"}>
					<Factions next={(blueId, redId) => onFactionsNext(blueId, redId)} />
				</Match>
			</Switch>
		</div>
	);
};
