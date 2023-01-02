import "./Map.less";

import { CampaignFlightGroup } from "@kilcekru/dcc-shared-rpc-types";
import L from "leaflet";
import { Symbol } from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { airdromes } from "../../data";
import { MapPosition } from "../../types";
import { calcFlightGroupPosition, positionToMapPosition } from "../../utils";
import { CampaignContext } from "../CampaignProvider";

const sidcUnitCode = {
	airport: "IBA---",
	airDefence: "UCD---",
	airDefenceMissle: "UCDM--",
	armour: "UCA---",
	armamentProduction: "IMG---",
	attack: "MFA---",
	aew: "MFRW--",
	fighter: "MFF---",
};

type SidcUnitCodeKey = keyof typeof sidcUnitCode;

export const Map = () => {
	let mapDiv: HTMLDivElement;
	const objectiveMarkers: Record<string, L.Marker> = {};
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

	const createSymbol = (mapPosition: MapPosition, hostile: boolean, air: boolean, unitCode: SidcUnitCodeKey) => {
		const map = leaftletMap();

		if (map == null) {
			return;
		}
		const symbol = new Symbol(`S${hostile ? "H" : "F"}${air ? "A" : "G"}-${sidcUnitCode[unitCode]}`, {
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

			createSymbol(mapPosition, false, false, "airport")?.bindPopup(airdromeName);
		});

		state.redFaction?.airdromes.forEach((airdromeName) => {
			const airdrome = airdromes.find((drome) => drome.name === airdromeName);

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome.position);

			createSymbol(mapPosition, true, false, "airport")?.bindPopup(airdromeName);
		});
	};

	const createObjectiveSymbols = () => {
		state.objectives.forEach((objective) => {
			const mapPosition = positionToMapPosition(objective.position);

			const str = objective.units.reduce((prev, unit) => {
				return prev + unit.displayName + (unit.alive ? "" : "[DESTROYED]") + "<br />";
			}, objective.name + "<br />");

			if (objective.coalition !== "neutral") {
				const marker = createSymbol(mapPosition, objective.coalition === "red", false, "armour")?.bindPopup(str);

				if (marker != null) {
					objectiveMarkers[objective.name] = marker;
				}
			}

			if (objective.coalition === "neutral" && objectiveMarkers[objective.name] != null) {
				objectiveMarkers[objective.name]?.remove();
			}
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

			const code = fg.task === "AWACS" ? "aew" : fg.task === "CAS" ? "attack" : "fighter";

			if (flightGroupMarkers[fg.id] == null) {
				const marker = createSymbol(positionToMapPosition(position), false, true, code as SidcUnitCodeKey)?.bindPopup(
					fg.name + " - " + fg.task
				);

				if (marker == null) {
					return;
				}

				flightGroupMarkers[fg.id] = marker;
			} else {
				flightGroupMarkers[fg.id]?.setLatLng(positionToMapPosition(position));
			}
		});
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
