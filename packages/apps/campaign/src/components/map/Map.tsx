import "./Map.less";
import "leaflet/dist/leaflet.css";

import type * as DcsJs from "@foxdelta2/dcsjs";
import L, { Content } from "leaflet";
import { Symbol } from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { OverlaySidebarContext } from "../../apps/home/components";
import { RunningCampaignState } from "../../logic/types";
import { getCoalitionFaction } from "../../logic/utils";
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
	ammoDepot: "IME---",
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
	let selectedMarkerId: string;
	const airdromeMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const objectiveMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const flightGroupMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const groundGroupMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const ewMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	let flightGroupLine: L.Polyline | undefined = undefined;
	const samCircles: Record<string, { circle: L.Circle; marker: L.Marker; symbolCode: string; color?: string }> = {};
	let winConditionCircle: L.CircleMarker | undefined = undefined;
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const [state, { selectFlightGroup }] = useContext(CampaignContext);
	const selectedFlightGroupMarkers: Array<L.Marker> = [];
	const dataStore = useContext(DataContext);
	const [overlaySidebarState, { openStructure, openFlightGroup, openGroundGroup, openAirdrome, openEWR, openSam }] =
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

	const createSymbol = ({
		mapPosition,
		hostile,
		air,
		unitCode,
		specialPrefix,
		onClick,
		color,
		riseOnHover = false,
	}: {
		mapPosition: MapPosition;
		hostile: boolean;
		air: boolean;
		unitCode: SidcUnitCodeKey;
		specialPrefix?: string;
		onClick?: () => void;
		color?: string;
		riseOnHover?: boolean;
	}) => {
		const map = leaftletMap();

		if (map == null) {
			return;
		}
		const symbolCode = specialPrefix
			? `G${hostile ? "H" : "F"}C*${sidcUnitCode[unitCode]}`
			: `S${hostile ? "H" : "F"}${air ? "A" : "G"}-${sidcUnitCode[unitCode]}`;
		const symbol = new Symbol(symbolCode, {
			size: 20,
			...(color == null
				? {}
				: {
						iconColor: color,
						colorMode: {
							Civilian: color,
							Friend: color,
							Hostile: color,
							Neutral: color,
							Unknown: color,
						},
				  }),
		});

		const icon = L.icon({
			iconUrl: symbol.toDataURL(),
			iconAnchor: L.point(symbol.getAnchor().x, symbol.getAnchor().y),
		});

		const marker = L.marker(mapPosition, { icon, riseOnHover, zIndexOffset: riseOnHover ? 100 : 0 }).addTo(map);

		if (onClick != null) {
			marker.addEventListener("click", onClick);
		}
		return { marker, symbolCode, color };
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

			const marker = createSymbol({
				mapPosition: mapPosition,
				hostile: false,
				air: false,
				unitCode: "airport",
				onClick: () => onClickAirdrome(airdromeName, "blue"),
				color: "rgb(0, 193, 255)",
				riseOnHover: true,
			});

			if (marker == null) {
				return;
			}

			airdromeMarkers[airdromeName] = marker;
		});

		state.redFaction?.airdromeNames.forEach((airdromeName) => {
			const airdrome = dataStore.airdromes?.[airdromeName];

			if (airdrome == null) {
				return;
			}

			const mapPosition = positionToMapPosition(airdrome);

			const marker = createSymbol({
				mapPosition: mapPosition,
				hostile: true,
				air: false,
				unitCode: "airport",
				onClick: () => onClickAirdrome(airdromeName, "red"),
				color: "rgb(255, 31, 31)",
				riseOnHover: true,
			});

			if (marker == null) {
				return;
			}

			airdromeMarkers[airdromeName] = marker;
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
				const marker = createSymbol({
					mapPosition: positionToMapPosition(fg.position),
					hostile: coalition === "red",
					air: true,
					unitCode: code as SidcUnitCodeKey,
					onClick: () => onClickFlightGroup(fg, coalition),
				});

				if (marker == null) {
					return;
				}

				flightGroupMarkers[fg.id] = marker;
			} else {
				flightGroupMarkers[fg.id]?.marker.setLatLng(positionToMapPosition(fg.position));
			}
		});
	};

	const createGroundGroupSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.groundGroups.forEach((gg) => {
			if (gg.position == null) {
				return;
			}

			if (groundGroupMarkers[gg.id] == null) {
				try {
					const marker = createSymbol({
						mapPosition: positionToMapPosition(gg.position),
						hostile: coalition === "red",
						air: false,
						unitCode: gg.groupType === "armor" ? "armor" : "infantry",
						onClick: () => onClickGroundGroup(gg, coalition),
					});

					if (marker == null) {
						return;
					}

					groundGroupMarkers[gg.id] = marker;
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e, coalition, gg);
				}
			} else {
				groundGroupMarkers[gg.id]?.marker.setLatLng(positionToMapPosition(gg.position));
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
					const marker = createSymbol({
						mapPosition: positionToMapPosition(gg.position),
						hostile: coalition === "red",
						air: false,
						unitCode: "radar",
						onClick: () => onClickEWR?.(gg, coalition),
					});

					if (marker == null) {
						return;
					}

					ewMarkers[gg.id] = marker;
				} else {
					ewMarkers[gg.id]?.marker.setLatLng(positionToMapPosition(gg.position));
				}
			} else {
				if (ewMarkers[gg.id] == null) {
					return;
				}

				removeSymbol(ewMarkers[gg.id]?.marker);
				delete ewMarkers[gg.id];
			}
		});
	};

	const createStructureSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		Object.values(faction.structures).forEach((structure) => {
			if (objectiveMarkers[structure.id] == null) {
				let unitCode: SidcUnitCodeKey = "militaryBase";

				switch (structure.structureType) {
					case "Fuel Storage":
						unitCode = "fuelStorage";
						break;
					case "Power Plant":
						unitCode = "powerPlant";
						break;
					case "Depot":
						unitCode = "depot";
						break;
					case "Ammo Depot":
						unitCode = "ammoDepot";
						break;
				}

				const marker = createSymbol({
					mapPosition: positionToMapPosition(structure.position),
					hostile: coalition === "red",
					air: false,
					unitCode,
					onClick: () => openStructure?.(structure.name, coalition),
					color:
						structure.structureType === "Farp"
							? coalition === "red"
								? "rgb(255, 31, 31)"
								: "rgb(0, 193, 255)"
							: undefined,
					riseOnHover: structure.structureType === "Farp",
				});

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
					const marker = createSymbol({
						mapPosition,
						hostile: coalition === "red",
						air: false,
						unitCode: "airDefenceMissle",
						onClick: () => onClickSam?.(sam.id, coalition),
					});

					const circle = L.circle(mapPosition, {
						radius: sam.range,
						color: coalition === "blue" ? "#80e0ff" : "#ff8080",
					}).addTo(map);

					if (circle == null || marker == null) {
						return;
					}

					samCircles[sam.id] = { circle, ...marker };
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
				removeSymbol(marker.marker);
				delete objectiveMarkers[id];
			}
		});
	};

	createEffect(() => {
		if (state.winningCondition.type === "objective") {
			const map = leaftletMap();

			if (map == null) {
				return;
			}

			const objectivePosition = state.objectives[state.winningCondition.value]?.position;

			if (objectivePosition == null) {
				return;
			}

			map.addEventListener("zoom", () => {
				if (winConditionCircle != null && map.hasLayer(winConditionCircle)) {
					map.removeLayer(winConditionCircle);
				}

				if (state.winningCondition.type === "objective") {
					winConditionCircle = L.circleMarker(mapPosition, {
						radius: 20,
						color: "#FFB91F",
					})
						.addTo(map)
						.bindTooltip(
							(
								<span>
									Capture <strong>{state.winningCondition.value}</strong>
								</span>
							) as Content,
							{ permanent: map.getZoom() >= 10 }
						);
				}
			});

			const mapPosition = positionToMapPosition(objectivePosition);

			winConditionCircle = L.circleMarker(mapPosition, {
				radius: 20,
				color: "#FFB91F",
			})
				.addTo(map)
				.bindTooltip(
					(
						<span>
							Capture <strong>{state.winningCondition.value}</strong>
						</span>
					) as Content
				);
		}
	});

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
			const marker = createSymbol({
				mapPosition: positionToMapPosition(waypoint.position),
				hostile: false,
				air: false,
				unitCode: "waypoint",
				specialPrefix: "123",
			})?.marker.bindTooltip(waypoint.name, { permanent: true });

			if (marker == null) {
				return;
			}

			selectedFlightGroupMarkers.push(marker);

			if (waypoint.racetrack != null) {
				const marker = createSymbol({
					mapPosition: positionToMapPosition(waypoint.racetrack.position),
					hostile: false,
					air: false,
					unitCode: "waypoint",
					specialPrefix: "123",
				})?.marker.bindTooltip("Track-race end", { permanent: true });

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
		const oldMarker =
			flightGroupMarkers[selectedMarkerId] ??
			groundGroupMarkers[selectedMarkerId] ??
			objectiveMarkers[selectedMarkerId] ??
			ewMarkers[selectedMarkerId] ??
			airdromeMarkers[selectedMarkerId] ??
			samCircles[selectedMarkerId];

		if (oldMarker != null) {
			const symbol = new Symbol(oldMarker.symbolCode, {
				size: 20,
				...(oldMarker.color == null
					? {}
					: {
							iconColor: oldMarker.color,
							colorMode: {
								Civilian: oldMarker.color,
								Friend: oldMarker.color,
								Hostile: oldMarker.color,
								Neutral: oldMarker.color,
								Unknown: oldMarker.color,
							},
					  }),
			});

			oldMarker.marker.setIcon(
				L.icon({
					iconUrl: symbol.toDataURL(),
					iconAnchor: L.point(symbol.getAnchor().x, symbol.getAnchor().y),
				})
			);
		}

		let marker = undefined;

		if (overlaySidebarState.state === "flight group") {
			const fgId = overlaySidebarState.flightGroupId;

			if (fgId == null) {
				return;
			}

			marker = flightGroupMarkers[fgId];
			selectedMarkerId = fgId;
		}

		if (overlaySidebarState.state === "ground group") {
			const ggId = overlaySidebarState.groundGroupId;

			if (ggId == null) {
				return;
			}

			marker = groundGroupMarkers[ggId];
			selectedMarkerId = ggId;
		}

		if (overlaySidebarState.state === "structure") {
			const name = overlaySidebarState.structureName;
			const faction = getCoalitionFaction(overlaySidebarState.coalition ?? "blue", state as RunningCampaignState);

			if (name == null) {
				return;
			}

			const structure = faction.structures[name];

			if (structure == null) {
				return;
			}

			marker = objectiveMarkers[structure.id];
			selectedMarkerId = structure.id;
		}

		if (overlaySidebarState.state === "ewr") {
			const id = overlaySidebarState.groundGroupId;
			const faction = getCoalitionFaction(overlaySidebarState.coalition ?? "blue", state as RunningCampaignState);

			if (id == null) {
				return;
			}

			const ewr = faction.ews.find((ew) => ew.id === id);

			if (ewr == null) {
				null;
			}

			marker = ewMarkers[id];
			selectedMarkerId = id;
		}

		if (overlaySidebarState.state === "airdrome") {
			const airdromeName = overlaySidebarState.airdromeName;

			if (airdromeName == null) {
				return;
			}

			marker = airdromeMarkers[airdromeName];
			selectedMarkerId = airdromeName;
		}

		if (overlaySidebarState.state === "sam") {
			const ggId = overlaySidebarState.groundGroupId;

			if (ggId == null) {
				return;
			}

			marker = samCircles[ggId];
			selectedMarkerId = ggId;
		}

		if (marker == null) {
			return;
		}

		const symbol = new Symbol(marker.symbolCode, {
			size: 25,
			iconColor: "rgb(255, 205, 0)",
			colorMode: {
				Civilian: "rgb(255, 205, 0)",
				Friend: "rgb(255, 205, 0)",
				Hostile: "rgb(255, 205, 0)",
				Neutral: "rgb(255, 205, 0)",
				Unknown: "rgb(255, 205, 0)",
			},
		});

		marker.marker.setIcon(
			L.icon({
				iconUrl: symbol.toDataURL(),
				iconAnchor: L.point(symbol.getAnchor().x, symbol.getAnchor().y),
			})
		);
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
				removeSymbol(marker.marker);
				delete flightGroupMarkers[id];
			}
		});

		const ggs = [...state.blueFaction.groundGroups, ...state.redFaction.groundGroups];

		Object.entries(groundGroupMarkers).forEach(([id, marker]) => {
			if (marker == null || ggs.some((fg) => fg.id === id)) {
				return;
			} else {
				removeSymbol(marker.marker);
				delete groundGroupMarkers[id];
			}
		});

		cleanupStructures();
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
