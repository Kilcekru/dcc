import { FactionData } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { airdromes, factionList } from "../../data";
import { Objectives } from "../../data/objectives";
import { AircraftType } from "../../types/aircraftType";
import { generateInitAircraftInventory } from "../../utils";
import { Factions, Start } from "./screens";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

const generateCampaign = (blueFactionName: string, redFactionName: string) => {
	const blueBaseFaction = factionList.find((f) => f.name === blueFactionName);
	const kobuleti = airdromes.find((drome) => drome.name === "Kobuleti");
	const sukhumi = airdromes.find((drome) => drome.name === "Sukhumi-Babushara");
	const mozdok = airdromes.find((drome) => drome.name === "Mozdok");

	if (blueBaseFaction == null) {
		throw "unknown faction: " + blueFactionName;
	}

	if (kobuleti == null || sukhumi == null || mozdok == null) {
		throw "airdrome not found";
	}

	const blueFaction: FactionData = {
		...blueBaseFaction,
		airdromes: ["Kobuleti"],
		objectives: [],
		activeAircrafts: generateInitAircraftInventory(
			blueBaseFaction.aircrafts as Array<AircraftType>,
			kobuleti.position,
			kobuleti.position
		),
		packages: [],
	};

	const redBaseFaction = factionList.find((f) => f.name === redFactionName);

	if (redBaseFaction == null) {
		throw "unknown faction: " + blueFactionName;
	}
	const redFaction: FactionData = {
		...redBaseFaction,
		airdromes: ["Sukhumi-Babushara", "Mozdok"],
		objectives: Objectives.map((obj) => obj.name),
		activeAircrafts: generateInitAircraftInventory(
			redBaseFaction.aircrafts as Array<AircraftType>,
			sukhumi.position,
			mozdok.position
		),
		packages: [],
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
