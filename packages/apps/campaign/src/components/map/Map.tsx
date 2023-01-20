import "./Map.less";
import "leaflet/dist/leaflet.css";

import type * as DcsJs from "@foxdelta2/dcsjs";
import L from "leaflet";
import { Symbol } from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { airdromes } from "../../data";
import { MapPosition } from "../../types";
import { positionToMapPosition } from "../../utils";
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
	waypoint: "OXRW--",
	militaryBase: "IB----",
};

type SidcUnitCodeKey = keyof typeof sidcUnitCode;

export const Map = () => {
	let mapDiv: HTMLDivElement;
	const objectiveMarkers: Record<string, L.Marker> = {};
	const flightGroupMarkers: Record<string, L.Marker> = {};
	let flightGroupLine: L.Polyline | undefined = undefined;
	const samCircles: Record<string, { circle: L.Circle; marker: L.Marker }> = {};
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const [state] = useContext(CampaignContext);
	const selectedFlightGroupMarkers: Array<L.Marker> = [];

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

	const removeSymbol = (marker: L.Marker | L.Circle | L.Polyline | undefined) => {
		const map = leaftletMap();

		if (map == null || marker == null) {
			return;
		}

		if (map.hasLayer(marker)) {
			map.removeLayer(marker);
		}
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

		state.blueFaction.airdromeNames.forEach((airdromeName) => {
			const airdrome = airdromes.find((drome) => drome.name === airdromeName);

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome.position);

			createSymbol(mapPosition, false, false, "airport")?.bindPopup(airdromeName);
		});

		state.redFaction?.airdromeNames.forEach((airdromeName) => {
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
				removeSymbol(objectiveMarkers[objective.name]);
			}

			objective.structures.forEach((structure) => {
				const mapPosition = positionToMapPosition(structure.position);

				if (objective.coalition !== "neutral") {
					const marker = createSymbol(mapPosition, objective.coalition === "red", false, "militaryBase")?.bindPopup(
						structure.name
					);

					if (marker != null) {
						objectiveMarkers[structure.id] = marker;
					}
				}

				if (objective.coalition === "neutral" && objectiveMarkers[structure.id] != null) {
					removeSymbol(objectiveMarkers[structure.id]);
				}
			});
		});
	};

	const createAircraftSymbols = (coalition: DcsJs.CampaignCoalition, packages: Array<DcsJs.CampaignPackage>) => {
		const flightGroups = packages?.reduce((prev, pkg) => {
			return [...prev, ...pkg.flightGroups.filter((fg) => fg.waypoints.length > 0)];
		}, [] as Array<DcsJs.CampaignFlightGroup>);

		flightGroups?.forEach((fg) => {
			if (fg.position == null) {
				return;
			}

			const code = fg.task === "AWACS" ? "aew" : fg.task === "CAS" ? "attack" : "fighter";

			if (flightGroupMarkers[fg.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(fg.position),
					coalition === "red",
					true,
					code as SidcUnitCodeKey
				)?.bindPopup(fg.name + " - " + fg.task);

				if (marker == null) {
					return;
				}

				flightGroupMarkers[fg.id] = marker;
			} else {
				flightGroupMarkers[fg.id]?.setLatLng(positionToMapPosition(fg.position));
			}
		});
	};

	const createSamSymbols = () => {
		state.redFaction?.sams.forEach((sam) => {
			if (sam.operational) {
				const mapPosition = positionToMapPosition(sam.position);
				const map = leaftletMap();

				if (map == null) {
					return;
				}

				if (samCircles[sam.id] == null) {
					const marker = createSymbol(mapPosition, true, false, "airDefenceMissle");

					const circle = L.circle(mapPosition, { radius: sam.range, color: "#ff8080" }).addTo(map);

					if (circle == null || marker == null) {
						return;
					}

					samCircles[sam.id] = { circle, marker };
				}
			} else {
				const samCircle = samCircles[sam.id];

				removeSymbol(samCircle?.circle);
				removeSymbol(samCircle?.marker);
			}
		});
	};

	// Selected Flight Group
	createEffect(() => {
		selectedFlightGroupMarkers.forEach((marker) => removeSymbol(marker));

		if (flightGroupLine != null) {
			removeSymbol(flightGroupLine);
			flightGroupLine = undefined;
		}

		if (state.selectedFlightGroup == null) {
			return;
		}

		state.selectedFlightGroup.waypoints.forEach((waypoint) => {
			const marker = createSymbol(positionToMapPosition(waypoint.position), false, false, "waypoint");

			if (marker == null) {
				return;
			}

			selectedFlightGroupMarkers.push(marker);

			if (waypoint.racetrack != null) {
				const marker = createSymbol(positionToMapPosition(waypoint.racetrack.position), false, true, "waypoint");

				if (marker == null) {
					return;
				}

				selectedFlightGroupMarkers.push(marker);
			}
		});

		const linePoints = state.selectedFlightGroup.waypoints.reduce((prev, waypoint) => {
			if (waypoint.racetrack == null) {
				return [...prev, positionToMapPosition(waypoint.position)];
			} else {
				return [...prev, positionToMapPosition(waypoint.position), positionToMapPosition(waypoint.racetrack.position)];
			}
		}, [] as Array<MapPosition>);

		const map = leaftletMap();

		if (map == null) {
			return;
		}

		flightGroupLine = L.polyline(linePoints, { color: "#80e0ff" }).addTo(map);
	});

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
		createSamSymbols();
	});

	// Package Markers
	createEffect(() => {
		const bluePackages = state.blueFaction?.packages;
		const redPackages = state.redFaction?.packages;

		if (bluePackages != null) {
			createAircraftSymbols("blue", bluePackages);
		}

		if (redPackages != null) {
			createAircraftSymbols("red", redPackages);
		}
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
