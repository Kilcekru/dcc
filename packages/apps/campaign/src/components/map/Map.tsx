import "./Map.less";

import { CampaignFlightGroup } from "@kilcekru/dcc-shared-rpc-types";
import L from "leaflet";
import { Symbol } from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { airdromes } from "../../data";
import { Objectives } from "../../data/objectives";
import { MapPosition } from "../../types";
import { calcFlightGroupPosition, positionToMapPosition } from "../../utils";
import { CampaignContext } from "../CampaignProvider";

const sidcUnitCode = {
	airport: "IBA",
	airDefence: "UCD",
	airDefenceMissle: "UCDM",
	armour: "UCA",
	armamentProduction: "IMG",
	attack: "MFA",
};

export const Map = () => {
	let mapDiv: HTMLDivElement;
	const flightGroupMarkers: Record<string, L.Marker> = {};
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const [state] = useContext(CampaignContext);

	const kobuleti = createMemo(() => {
		const position = airdromes.find((drome) => drome.name === "Kobuleti")?.position;

		if (position == null) {
			return;
		}

		return positionToMapPosition(position);
	});

	const createSymbol = (
		mapPosition: MapPosition,
		hostile: boolean,
		air: boolean,
		unitCode: keyof typeof sidcUnitCode
	) => {
		const map = leaftletMap();

		if (map == null) {
			return;
		}
		const symbol = new Symbol(`S${hostile ? "H" : "F"}${air ? "A" : "G"}-${sidcUnitCode[unitCode]}----`, {
			size: 20,
		});

		const icon = L.icon({
			iconUrl: symbol.toDataURL(),
			iconAnchor: L.point(symbol.getAnchor().x, symbol.getAnchor().y),
		});

		return L.marker(mapPosition, { icon }).addTo(map);
	};

	createEffect(() => {
		const blueAirport = kobuleti();

		if (blueAirport == null) {
			return;
		}

		setMap(L.map(mapDiv).setView(blueAirport, 8));
	});

	const createAirdromeSymbols = () => {
		if (state?.blueFaction == null) {
			return;
		}

		state.blueFaction.airdromes.forEach((airdromeName) => {
			const airdrome = airdromes.find((drome) => drome.name === airdromeName);

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome.position);

			createSymbol(mapPosition, false, false, "airport");
		});

		state.redFaction?.airdromes.forEach((airdromeName) => {
			const airdrome = airdromes.find((drome) => drome.name === airdromeName);

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome.position);

			createSymbol(mapPosition, true, false, "airport");
		});
	};

	const createObjectiveSymbols = () => {
		state.redFaction?.objectives.forEach((objectiveName) => {
			const objective = Objectives.find((obj) => obj.name === objectiveName);

			if (objective == null) {
				return;
			}

			const mapPosition = positionToMapPosition(objective.position);

			createSymbol(mapPosition, true, false, "armamentProduction");
		});
	};

	createEffect(() => {
		const map = leaftletMap();
		if (map == null) {
			return;
		}

		// Create Tile Layer
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		createAirdromeSymbols();
		createObjectiveSymbols();
	});

	// Package Markers
	createEffect(() => {
		const packages = state.blueFaction?.packages;

		const flightGroups = packages?.reduce((prev, pkg) => {
			return [...prev, ...pkg.flightGroups.filter((fg) => fg.waypoints.length > 0)];
		}, [] as Array<CampaignFlightGroup>);

		flightGroups?.forEach((fg) => {
			const position = calcFlightGroupPosition(fg, state.timer);

			if (position == null) {
				return;
			}

			if (flightGroupMarkers[fg.name] == null) {
				const marker = createSymbol(positionToMapPosition(position), false, true, "attack");

				if (marker == null) {
					return;
				}

				flightGroupMarkers[fg.name] = marker;
			} else {
				flightGroupMarkers[fg.name]?.setLatLng(positionToMapPosition(position));
			}
		});
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
