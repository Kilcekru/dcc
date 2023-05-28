import "./Map.less";
import "leaflet/dist/leaflet.css";

import type * as DcsJs from "@foxdelta2/dcsjs";
import L from "leaflet";
import { Symbol } from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { OverlaySidebarContext } from "../../apps/home/components";
import { MapPosition } from "../../types";
import { getFlightGroups, positionToMapPosition } from "../../utils";
import { CampaignContext } from "../CampaignProvider";
import { DataContext } from "../DataProvider";

const sidcUnitCode = {
	airport: "IBA---",
	airDefence: "UCD---",
	airDefenceMissle: "UCDM--",
	armor: "UCA---",
	infantry: "UCI---",
	armamentProduction: "IMG---",
	fuelStorage: "IRP---",
	powerPlant: "IUE---",
	depot: "IMV---",
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
	const [state, { selectFlightGroup }] = useContext(CampaignContext);
	const selectedFlightGroupMarkers: Array<L.Marker> = [];
	const dataStore = useContext(DataContext);
	const [, { openStructure, openFlightGroup, openGroundGroup, openAirdrome, openEWR, openSam }] =
		useContext(OverlaySidebarContext);

	const kobuleti = createMemo(() => {
		const position = dataStore.airdromes?.["Kobuleti"];

		if (position == null) {
			return;
		}

		return positionToMapPosition(position);
	});

	const onClickFlightGroup = (flightGroup: DcsJs.CampaignFlightGroup, coalition: DcsJs.CampaignCoalition) => {
		selectFlightGroup?.(flightGroup);
		openFlightGroup?.(flightGroup.id, coalition);
	};

	const onClickGroundGroup = (groundGroup: DcsJs.CampaignGroundGroup, coalition: DcsJs.CampaignCoalition) => {
		openGroundGroup?.(groundGroup.id, coalition);
	};

	const onClickEWR = (groundGroup: DcsJs.CampaignGroundGroup, coalition: DcsJs.CampaignCoalition) => {
		openEWR?.(groundGroup.id, coalition);
	};

	const onClickAirdrome = (airdromeName: string, coalition: DcsJs.CampaignCoalition) => {
		openAirdrome?.(airdromeName, coalition);
	};

	const onClickSam = (id: string, coalition: DcsJs.CampaignCoalition) => {
		openSam?.(id, coalition);
	};

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

			createSymbol(mapPosition, false, false, "airport")?.addEventListener("click", () =>
				onClickAirdrome(airdromeName, "blue")
			);
		});

		state.redFaction?.airdromeNames.forEach((airdromeName) => {
			const airdrome = dataStore.airdromes?.[airdromeName];

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome);

			createSymbol(mapPosition, true, false, "airport")?.addEventListener("click", () =>
				onClickAirdrome(airdromeName, "red")
			);
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

			const code = fg.task === "AWACS" ? "aew" : fg.task === "CAS" ? "attack" : "fighter";

			if (flightGroupMarkers[fg.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(fg.position),
					coalition === "red",
					true,
					code as SidcUnitCodeKey
				)?.addEventListener("click", () => onClickFlightGroup(fg, coalition));

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

			if (groundGroupMarkers[gg.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(gg.position),
					coalition === "red",
					false,
					gg.groupType === "armor" ? "armor" : "infantry"
				)?.addEventListener("click", () => onClickGroundGroup(gg, coalition));

				if (marker == null) {
					return;
				}

				groundGroupMarkers[gg.id] = marker;
			} else {
				groundGroupMarkers[gg.id]?.setLatLng(positionToMapPosition(gg.position));
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
				if (ewMarkers[gg.id] == null) {
					const marker = createSymbol(
						positionToMapPosition(gg.position),
						coalition === "red",
						false,
						"radar"
					)?.addEventListener("click", () => onClickEWR?.(gg, coalition));

					if (marker == null) {
						return;
					}

					ewMarkers[gg.id] = marker;
				} else {
					ewMarkers[gg.id]?.setLatLng(positionToMapPosition(gg.position));
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

	const createStructureSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		Object.values(faction.structures).forEach((structure) => {
			if (objectiveMarkers[structure.id] == null) {
				const marker = createSymbol(
					positionToMapPosition(structure.position),
					coalition === "red",
					false,
					"militaryBase"
				)?.addEventListener("click", () => openStructure?.(structure.name, coalition));

				if (marker != null) {
					objectiveMarkers[structure.id] = marker;
				}
			}
		});
	};

	const createSamSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.sams.forEach((sam) => {
			if (sam.operational) {
				const mapPosition = positionToMapPosition(sam.position);
				const map = leaftletMap();

				if (map == null) {
					return;
				}

				if (samCircles[sam.id] == null) {
					const marker = createSymbol(mapPosition, coalition === "red", false, "airDefenceMissle")?.addEventListener(
						"click",
						() => onClickSam?.(sam.id, coalition)
					);

					const circle = L.circle(mapPosition, {
						radius: sam.range,
						color: coalition === "blue" ? "#80e0ff" : "#ff8080",
					}).addTo(map);

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

	const cleanupStructures = () => {
		Object.entries(objectiveMarkers).forEach(([id, marker]) => {
			const blueStructure = Object.values(state.blueFaction?.structures ?? {}).some((structure) => structure.id === id);
			const redStructure = Object.values(state.redFaction?.structures ?? {}).some((structure) => structure.id === id);

			if (!blueStructure && !redStructure) {
				removeSymbol(marker);
				delete objectiveMarkers[id];
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
			const marker = createSymbol(
				positionToMapPosition(waypoint.position),
				false,
				false,
				"waypoint",
				"123"
			)?.bindTooltip(waypoint.name, { permanent: true });

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
				)?.bindTooltip("Track-race end", { permanent: true });

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
		createStructureSymbols("blue", state.blueFaction);
		createSamSymbols("blue", state.blueFaction);
		createAircraftSymbols("red", redPackages);
		createGroundGroupSymbols("red", state.redFaction);
		createEWSymbols("red", state.redFaction);
		createStructureSymbols("red", state.redFaction);
		createSamSymbols("red", state.redFaction);

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

		cleanupStructures();
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
