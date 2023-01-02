import { CampaignObjective, CampaignUnit, FactionData } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, createUniqueId, Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../components";
import { airdromes, factionList } from "../../data";
import { Objectives } from "../../data/objectives";
import { Objective } from "../../types";
import { AircraftType } from "../../types/aircraftType";
import { distanceToPosition, generateInitAircraftInventory, random } from "../../utils";
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

	const nearestObjective = Objectives.reduce(
		([prevObj, prevDistance], obj) => {
			const distance = distanceToPosition(kobuleti.position, obj.position);

			if (distance < prevDistance) {
				return [obj, distance] as [Objective | undefined, number];
			} else {
				return [prevObj, prevDistance] as [Objective | undefined, number];
			}
		},
		[undefined, 10000000] as [Objective | undefined, number]
	)[0];

	const blueFaction: FactionData = {
		...blueBaseFaction,
		airdromes: ["Kobuleti"],
		activeAircrafts: generateInitAircraftInventory(
			blueBaseFaction.aircrafts as Array<AircraftType>,
			blueBaseFaction.awacs as Array<AircraftType>,
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

		activeAircrafts: generateInitAircraftInventory(
			redBaseFaction.aircrafts as Array<AircraftType>,
			redBaseFaction.awacs as Array<AircraftType>,
			sukhumi.position,
			mozdok.position
		),
		packages: [],
	};

	return {
		blueFaction,
		redFaction,
		objectives: Objectives.map((obj) => {
			const isBlue = nearestObjective?.name === obj.name;
			const unit: CampaignUnit = {
				id: createUniqueId(),
				name: isBlue ? "M-2 Bradley" : "BMP-2",
				displayName: isBlue ? "M-2 Bradley" : "BMP-2",
				alive: true,
				category: "Armor",
			};

			const units: Array<CampaignUnit> = [];

			Array.from({ length: random(4, 8) }, () => units.push({ ...unit, id: createUniqueId() }));
			return {
				name: obj.name,
				position: obj.position,
				units: units,
				coalition: isBlue ? "blue" : "red",
			} as CampaignObjective;
		}),
	};
};

export const CreateCampaign = () => {
	const [currentScreen, setCurrentScreen] = createSignal("Start");
	const [, { activate }] = useContext(CampaignContext);

	const onFactionsNext = (blueId: string, redId: string) => {
		const factions = generateCampaign(blueId, redId);
		activate?.(factions.blueFaction, factions.redFaction, factions.objectives);
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
