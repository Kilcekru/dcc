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
	armor: "UCA---",
	infantry: "UCI---",
	armamentProduction: "IMG---",
	attack: "MFA---",
	aew: "MFRW--",
	fighter: "MFF---",
	waypoint: "MGPI--",
	militaryBase: "IB----",
	radar: "ESR---",
};

type SidcUnitCodeKey = keyof typeof sidcUnitCode;

export const Map = () => {
	let mapDiv: HTMLDivElement;
	const objectiveMarkers: Record<string, L.Marker | undefined> = {};
	const flightGroupMarkers: Record<string, L.Marker | undefined> = {};
	const groundGroupMarkers: Record<string, L.Marker | undefined> = {};
	const ewMarkers: Record<string, L.Marker | undefined> = {};
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

	const createSymbol = (
		mapPosition: MapPosition,
		hostile: boolean,
		air: boolean,
		unitCode: SidcUnitCodeKey,
		specialPrefix?: string
	) => {
		const map = leaftletMap();

		if (map == null) {
			return;
		}
		const symbol = specialPrefix
			? new Symbol(`G${hostile ? "H" : "F"}C*${sidcUnitCode[unitCode]}`, {
					size: 20,
			  })
			: new Symbol(`S${hostile ? "H" : "F"}${air ? "A" : "G"}-${sidcUnitCode[unitCode]}`, {
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
		Object.values(state.objectives).forEach((objective) => {
			const faction = objective.coalition === "blue" ? state.blueFaction : state.redFaction;

			if (faction == null) {
				return;
			}

			const highestGroupId = objective.structures.reduce((prev, structure) => {
				return structure.groupId > prev ? structure.groupId : prev;
			}, 0);

			Array.from({ length: highestGroupId }).forEach((_, i) => {
				const structures = objective.structures.filter((str) => str.groupId === i + 1);

				const structure = firstItem(structures);

				if (structure == null) {
					return;
				}

				if (structures.filter((str) => str.alive).length === 0) {
					if (objectiveMarkers[structure.id] != null) {
						removeSymbol(objectiveMarkers[structure.id]);
						objectiveMarkers[structure.id] = undefined;
					}
				}

				const str = structures.reduce((prev, struct) => {
					return prev + struct.name + (struct.alive ? "" : "[DESTROYED]") + "<br />";
				}, objective.name + "<br />");

				const marker = createSymbol(
					positionToMapPosition(structure.position),
					objective.coalition === "red",
					false,
					"militaryBase"
				)?.bindPopup(str);

				if (marker != null) {
					objectiveMarkers[structure.id] = marker;
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

			if (fg.startTime >= state.timer) {
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
			}, gg.objective.name + "<br />");

			if (groundGroupMarkers[gg.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(gg.position),
					coalition === "red",
					false,
					gg.groupType === "armor" ? "armor" : "infantry"
				)?.bindPopup(str);

				if (marker == null) {
					return;
				}

				groundGroupMarkers[gg.id] = marker;
			} else {
				groundGroupMarkers[gg.id]?.setLatLng(positionToMapPosition(gg.position));
				groundGroupMarkers[gg.id]?.setPopupContent(str);
			}
		});
	};

	const createEWSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.ews.forEach((gg) => {
			if (gg.position == null) {
				return;
			}

			const hasAliveUnits = gg.unitIds.some((id) => faction.inventory.groundUnits[id]?.alive);

			if (hasAliveUnits) {
				const str = gg.unitIds.reduce((prev, unitId) => {
					const unit = faction.inventory.groundUnits[unitId];

					if (unit == null) {
						return prev;
					}

					return prev + unit.displayName + (unit.alive ? "" : "[DESTROYED]") + "<br />";
				}, gg.objective.name + "<br />");

				if (ewMarkers[gg.id] == null) {
					const marker = createSymbol(
						positionToMapPosition(gg.position),
						coalition === "red",
						false,
						"radar"
					)?.bindPopup(str);

					if (marker == null) {
						return;
					}

					ewMarkers[gg.id] = marker;
				} else {
					ewMarkers[gg.id]?.setLatLng(positionToMapPosition(gg.position));
					ewMarkers[gg.id]?.setPopupContent(str);
				}
			} else {
				if (ewMarkers[gg.id] == null) {
					return;
				}

				removeSymbol(ewMarkers[gg.id]);
				ewMarkers[gg.id] = undefined;
			}
		});
	};

	const createSamSymbols = () => {
		state.blueFaction?.sams.forEach((sam) => {
			if (sam.operational) {
				const mapPosition = positionToMapPosition(sam.position);
				const map = leaftletMap();

				if (map == null) {
					return;
				}

				if (samCircles[sam.id] == null) {
					const str = sam.units.reduce((prev, unit) => {
						if (unit == null) {
							return prev;
						}

						return prev + unit.displayName + (unit.alive ? "" : "[DESTROYED]") + "<br />";
					}, sam.name + "<br />");

					const marker = createSymbol(mapPosition, false, false, "airDefenceMissle")?.bindPopup(str);

					const circle = L.circle(mapPosition, { radius: sam.range, color: "#80e0ff" }).addTo(map);

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

		state.redFaction?.sams.forEach((sam) => {
			if (sam.operational) {
				const mapPosition = positionToMapPosition(sam.position);
				const map = leaftletMap();

				if (map == null) {
					return;
				}

				if (samCircles[sam.id] == null) {
					const str = sam.units.reduce((prev, unit) => {
						if (unit == null) {
							return prev;
						}

						return prev + unit.displayName + (unit.alive ? "" : "[DESTROYED]") + "<br />";
					}, sam.name + "<br />");

					const marker = createSymbol(mapPosition, true, false, "airDefenceMissle")?.bindPopup(str);

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
			const marker = createSymbol(positionToMapPosition(waypoint.position), false, false, "waypoint", "123");

			if (marker == null) {
				return;
			}

			selectedFlightGroupMarkers.push(marker);

			if (waypoint.racetrack != null) {
				const marker = createSymbol(
					positionToMapPosition(waypoint.racetrack.position),
					false,
					false,
					"waypoint",
					"123"
				);

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

		flightGroupLine = L.polyline(linePoints, { color: "#2a2a2a" }).addTo(map);
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
		if (state.blueFaction == null || state.redFaction == null) {
			return;
		}

		const bluePackages = state.blueFaction.packages;
		const redPackages = state.redFaction.packages;

		createAircraftSymbols("blue", bluePackages);
		createGroundGroupSymbols("blue", state.blueFaction);
		createEWSymbols("blue", state.blueFaction);
		createAircraftSymbols("red", redPackages);
		createGroundGroupSymbols("red", state.redFaction);
		createEWSymbols("red", state.redFaction);

		const fgs = [...getFlightGroups(bluePackages), ...getFlightGroups(redPackages)];

		Object.entries(flightGroupMarkers).forEach(([id, marker]) => {
			if (marker == null || fgs.some((fg) => fg.id === id)) {
				return;
			} else {
				removeSymbol(marker);
				flightGroupMarkers[id] = undefined;
			}
		});

		const ggs = [...state.blueFaction.groundGroups, ...state.redFaction.groundGroups];

		Object.entries(groundGroupMarkers).forEach(([id, marker]) => {
			if (marker == null || ggs.some((fg) => fg.id === id)) {
				return;
			} else {
				removeSymbol(marker);
				groundGroupMarkers[id] = undefined;
			}
		});
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
