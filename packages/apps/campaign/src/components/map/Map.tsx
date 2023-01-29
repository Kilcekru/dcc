import "./Map.less";
import "leaflet/dist/leaflet.css";

import type * as DcsJs from "@foxdelta2/dcsjs";
import L from "leaflet";
import { Symbol } from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { MapPosition } from "../../types";
import { firstItem, getFlightGroups, positionToMapPosition } from "../../utils";
import { CampaignContext } from "../CampaignProvider";
import { DataContext } from "../DataProvider";

const sidcUnitCode = {
	airport: "IBA---",
	airDefence: "UCD---",
	airDefenceMissle: "UCDM--",
	armour: "UCA---",
	infantry: "UCI---",
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
	const flightGroupMarkers: Record<string, L.Marker | undefined> = {};
	const groundGroupMarkers: Record<string, L.Marker | undefined> = {};
	let flightGroupLine: L.Polyline | undefined = undefined;
	const samCircles: Record<string, { circle: L.Circle; marker: L.Marker }> = {};
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const [state] = useContext(CampaignContext);
	const selectedFlightGroupMarkers: Array<L.Marker> = [];
	const dataStore = useContext(DataContext);

	const kobuleti = createMemo(() => {
		const position = dataStore.airdromes?.["Kobuleti"];

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
			const airdrome = dataStore.airdromes?.[airdromeName];

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome);

			createSymbol(mapPosition, false, false, "airport")?.bindPopup(airdromeName);
		});

		state.redFaction?.airdromeNames.forEach((airdromeName) => {
			const airdrome = dataStore.airdromes?.[airdromeName];

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome);

			createSymbol(mapPosition, true, false, "airport")?.bindPopup(airdromeName);
		});
	};

	const createObjectiveSymbols = () => {
		state.objectives.forEach((objective) => {
			const faction = objective.coalition === "blue" ? state.blueFaction : state.redFaction;

			if (faction == null) {
				return;
			}

			if (objective.coalition === "neutral" && objectiveMarkers[objective.name] != null) {
				removeSymbol(objectiveMarkers[objective.name]);
			}

			objective.structures.forEach((structure) => {
				const mapPosition = positionToMapPosition(structure.position);

				if (objective.coalition !== "neutral" && structure.alive) {
					const marker = createSymbol(mapPosition, objective.coalition === "red", false, "militaryBase")?.bindPopup(
						structure.alive ? structure.name : `${structure.name}[DESTROYED]`
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

			const str = `${coalition === "red" ? "[R]" : "[B]"}${fg.name} - ${fg.task}`;

			const code = fg.task === "AWACS" ? "aew" : fg.task === "CAS" ? "attack" : "fighter";

			if (flightGroupMarkers[fg.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(fg.position),
					coalition === "red",
					true,
					code as SidcUnitCodeKey
				)?.bindPopup(str);

				if (marker == null) {
					return;
				}

				flightGroupMarkers[fg.id] = marker;
			} else {
				flightGroupMarkers[fg.id]?.setLatLng(positionToMapPosition(fg.position));
			}
		});
	};

	const createGroundGroupSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.groundGroups.forEach((gg) => {
			if (gg.position == null) {
				return;
			}

			const str = gg.unitIds.reduce((prev, unitId) => {
				const unit = faction.inventory.groundUnits[unitId];

				if (unit == null) {
					return prev;
				}

				return prev + unit.displayName + (unit.alive ? "" : "[DESTROYED]") + "<br />";
			}, "");

			const firstUnit = faction.inventory.groundUnits[firstItem(gg.unitIds) ?? ""];

			if (firstUnit == null) {
				return;
			}

			const isArmour = firstUnit.vehicleTypes.some((vt) => vt === "Armored");

			if (groundGroupMarkers[gg.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(gg.position),
					coalition === "red",
					false,
					isArmour ? "armour" : "infantry"
				)?.bindPopup(str);

				if (marker == null) {
					return;
				}

				groundGroupMarkers[gg.id] = marker;
			} else {
				groundGroupMarkers[gg.id]?.setLatLng(positionToMapPosition(gg.position));
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

		if (bluePackages != null && state.blueFaction != null) {
			createAircraftSymbols("blue", bluePackages);
			createGroundGroupSymbols("blue", state.blueFaction);
		}

		if (redPackages != null && state.redFaction != null) {
			createAircraftSymbols("red", redPackages);
			createGroundGroupSymbols("red", state.redFaction);
		}

		const fgs = [...getFlightGroups(bluePackages), ...getFlightGroups(redPackages)];

		Object.entries(flightGroupMarkers).forEach(([id, marker]) => {
			if (marker == null || fgs.some((fg) => fg.id === id)) {
				return;
			} else {
				removeSymbol(marker);
				flightGroupMarkers[id] = undefined;
			}
		});
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
