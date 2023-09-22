import "./Map.less";
import "leaflet/dist/leaflet.css";

import type * as DcsJs from "@foxdelta2/dcsjs";
import L, { Content } from "leaflet";
import MilSymbol from "milsymbol";
import { createEffect, createMemo, createSignal, useContext } from "solid-js";

import { OverlaySidebarContext } from "../../apps/home/components";
import * as Domain from "../../domain";
import { RunningCampaignState } from "../../logic/types";
import { getCoalitionFaction } from "../../logic/utils";
import { MapPosition } from "../../types";
import { getFlightGroups, usePositionToMapPosition } from "../../utils";
import { CampaignContext } from "../CampaignProvider";
import { useDataStore } from "../DataProvider";

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
	installation: "I-----",
	transport: "IT----",
	radar: "ESR---",
	carrier: "CLCV--",
	downedPilot: "USS6--",
	hospital: "IXH---",
	attackHelicopter: "MHA---",
	csar: "MHH---",
};

type SidcUnitCodeKey = keyof typeof sidcUnitCode;

export const Map = () => {
	let mapDiv: HTMLDivElement;
	let selectedMarkerId: string;
	const airdromeMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const objectiveMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const flightGroupMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const groundGroupMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const shipGroupMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const downedPilotMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	const ewMarkers: Record<string, { marker: L.Marker; symbolCode: string; color?: string }> = {};
	let flightGroupLine: L.Polyline | undefined = undefined;
	const samCircles: Record<string, { circle: L.Circle; marker: L.Marker; symbolCode: string; color?: string }> = {};
	let winConditionCircle: L.CircleMarker | undefined = undefined;
	// const objectiveCircles: Record<string, L.CircleMarker> = {};
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const [state, { selectFlightGroup }] = useContext(CampaignContext);
	const selectedFlightGroupMarkers: Array<L.Marker> = [];
	const dataStore = useDataStore();
	const positionToMapPosition = usePositionToMapPosition();
	const [overlaySidebarState, { openStructure, openFlightGroup, openGroundGroup, openAirdrome, openSam }] =
		useContext(OverlaySidebarContext);

	const centerAirdrome = createMemo(() => {
		const airdromeName = state.blueFaction?.airdromeNames[0];

		if (airdromeName == null) {
			return;
		}

		const airdrome = dataStore.airdromes?.[airdromeName];

		if (airdrome == null) {
			return;
		}

		return positionToMapPosition(airdrome);
	});

	const onClickFlightGroup = (flightGroup: DcsJs.CampaignFlightGroup, coalition: DcsJs.CampaignCoalition) => {
		selectFlightGroup?.(flightGroup);
		openFlightGroup?.(flightGroup.id, coalition);
	};

	const onClickGroundGroup = (groundGroup: DcsJs.GroundGroup, coalition: DcsJs.CampaignCoalition) => {
		openGroundGroup?.(groundGroup.id, coalition);
	};

	/* const onClickEWR = (groundGroup: DcsJs.CampaignGroundGroup, coalition: DcsJs.CampaignCoalition) => {
		openEWR?.(groundGroup.id, coalition);
	}; */

	const onClickAirdrome = (airdromeName: string, coalition: DcsJs.CampaignCoalition) => {
		openAirdrome?.(airdromeName, coalition);
	};

	const onClickSam = (id: string, coalition: DcsJs.CampaignCoalition) => {
		openSam?.(id, coalition);
	};

	const createSymbol = ({
		mapPosition,
		hostile,
		domain,
		unitCode,
		specialPrefix,
		onClick,
		color,
		riseOnHover = false,
	}: {
		mapPosition: MapPosition;
		hostile: boolean;
		domain: "air" | "ground" | "sea";
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
			: `S${hostile ? "H" : "F"}${domain === "air" ? "A" : domain === "sea" ? "S" : "G"}-${sidcUnitCode[unitCode]}`;
		const symbol = new MilSymbol.Symbol(symbolCode, {
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

	const removeSymbol = (marker: L.Marker | L.Circle | L.CircleMarker | L.Polyline | undefined) => {
		const map = leaftletMap();

		if (map == null || marker == null) {
			return;
		}

		if (map.hasLayer(marker)) {
			map.removeLayer(marker);
		}
	};

	createEffect(() => {
		const blueAirport = centerAirdrome();

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
				domain: "ground",
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
				domain: "ground",
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

	const createAircraftSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		const flightGroups = faction.packages?.reduce((prev, pkg) => {
			return [...prev, ...pkg.flightGroups.filter((fg) => fg.waypoints.length > 0)];
		}, [] as Array<DcsJs.CampaignFlightGroup>);

		flightGroups?.forEach((fg) => {
			if (fg.position == null) {
				return;
			}

			if (fg.startTime >= state.timer) {
				return;
			}

			// const code = fg.task === "AWACS" ? "aew" : fg.task === "CAS" ? "attack" : "fighter";
			let code: SidcUnitCodeKey = "fighter";

			switch (fg.task) {
				case "AWACS":
					code = "aew";
					break;
				case "CAS": {
					const isHelicopter = Domain.FlightGroup.hasHelicopter(fg, faction, dataStore);

					code = isHelicopter ? "attackHelicopter" : "attack";
					break;
				}
				case "Pinpoint Strike":
					code = "attack";
					break;
				case "CSAR":
					code = "csar";
					break;
			}

			let position: MapPosition = [0, 0];

			try {
				position = positionToMapPosition(fg.position);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error("invalid position for fg ", fg.name);
			}

			if (flightGroupMarkers[fg.id] == null) {
				const marker = createSymbol({
					mapPosition: position,
					hostile: coalition === "red",
					domain: "air",
					unitCode: code,
					onClick: () => onClickFlightGroup(fg, coalition),
				});

				if (marker == null) {
					return;
				}

				flightGroupMarkers[fg.id] = marker;
			} else {
				flightGroupMarkers[fg.id]?.marker.setLatLng(position);
			}
		});
	};

	const createGroundGroupSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.groundGroups.forEach((gg) => {
			if (gg.position == null || gg.type === "sam") {
				return;
			}

			if (groundGroupMarkers[gg.id] == null) {
				try {
					const marker = createSymbol({
						mapPosition: positionToMapPosition(gg.position),
						hostile: coalition === "red",
						domain: "ground",
						unitCode: gg.type === "armor" ? "armor" : "infantry",
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

	const createShipGroupSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.shipGroups?.forEach((sg) => {
			if (sg.position == null) {
				return;
			}

			if (shipGroupMarkers[sg.name] == null) {
				try {
					const marker = createSymbol({
						mapPosition: positionToMapPosition(sg.position),
						hostile: coalition === "red",
						domain: "sea",
						unitCode: "carrier",
						onClick: () => null,
					});

					if (marker == null) {
						return;
					}

					shipGroupMarkers[sg.name] = marker;
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e, coalition, sg);
				}
			} else {
				shipGroupMarkers[sg.name]?.marker.setLatLng(positionToMapPosition(sg.position));
			}
		});
	};

	const createDownedPilotSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		faction.downedPilots.forEach((pilot) => {
			if (pilot.position == null) {
				return;
			}

			if (downedPilotMarkers[pilot.id] == null) {
				try {
					const marker = createSymbol({
						mapPosition: positionToMapPosition(pilot.position),
						hostile: coalition === "red",
						domain: "ground",
						unitCode: "downedPilot",
						onClick: () => null,
					});

					if (marker == null) {
						return;
					}

					downedPilotMarkers[pilot.id] = marker;
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error(e, coalition, pilot);
				}
			}
		});
	};

	/* const createEWSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
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
	}; */

	const createStructureSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		Object.values(faction.structures).forEach((structure) => {
			if (objectiveMarkers[structure.id] == null) {
				let unitCode: SidcUnitCodeKey = "installation";

				switch (structure.type) {
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
					case "Hospital":
						unitCode = "hospital";
						break;
					case "Farp":
						unitCode = "militaryBase";
						break;
					case "Barrack":
						unitCode = "transport";
						break;
				}

				const marker = createSymbol({
					mapPosition: positionToMapPosition(structure.position),
					hostile: coalition === "red",
					domain: "ground",
					unitCode,
					onClick: () => openStructure?.(structure.name, coalition),
					color:
						structure.type === "Farp" ? (coalition === "red" ? "rgb(255, 31, 31)" : "rgb(0, 193, 255)") : undefined,
					riseOnHover: structure.type === "Farp",
				});

				if (marker != null) {
					objectiveMarkers[structure.id] = marker;
				}
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

	const createSamSymbols = (coalition: DcsJs.CampaignCoalition, faction: DcsJs.CampaignFaction) => {
		Domain.Faction.getSamGroups(faction).forEach((sam) => {
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
						domain: "ground",
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
							{ permanent: map.getZoom() >= 10 },
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
					) as Content,
				);
		}
	});

	/* createEffect(() => {
		const map = leaftletMap();

		if (map == null) {
			return;
		}

		Object.values(state.objectives).forEach((obj) => {
			const mapPosition = positionToMapPosition(obj.position);
			const marker = objectiveCircles[obj.name];

			if (marker == null) {
				objectiveCircles[obj.name] = L.circleMarker(mapPosition, {
					radius: 20,
					color: obj.coalition === "blue" ? "#80e0ff" : obj.coalition === "red" ? "#ff8080" : undefined,
				})
					.addTo(map)
					.bindTooltip((<span>{obj.name}</span>) as Content, { permanent: map.getZoom() >= 10 });
			} else {
				removeSymbol(marker);

				objectiveCircles[obj.name] = L.circleMarker(mapPosition, {
					radius: 20,
					color: obj.coalition === "blue" ? "#80e0ff" : obj.coalition === "red" ? "#ff8080" : undefined,
				})
					.addTo(map)
					.bindTooltip((<span>{obj.name}</span>) as Content, { permanent: map.getZoom() >= 10 });
			}
		});
	}); */

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
				domain: "ground",
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
					domain: "ground",
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
			const symbol = new MilSymbol.Symbol(oldMarker.symbolCode, {
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
				}),
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

		const symbol = new MilSymbol.Symbol(marker.symbolCode, {
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
			}),
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

		createAircraftSymbols("blue", state.blueFaction);
		createGroundGroupSymbols("blue", state.blueFaction);
		// createEWSymbols("blue", state.blueFaction);
		createStructureSymbols("blue", state.blueFaction);
		createSamSymbols("blue", state.blueFaction);
		createShipGroupSymbols("blue", state.blueFaction);
		createDownedPilotSymbols("blue", state.blueFaction);
		createAircraftSymbols("red", state.redFaction);
		createGroundGroupSymbols("red", state.redFaction);
		// createEWSymbols("red", state.redFaction);
		createStructureSymbols("red", state.redFaction);
		createSamSymbols("red", state.redFaction);
		createShipGroupSymbols("red", state.redFaction);
		createDownedPilotSymbols("red", state.redFaction);
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

		const pilots = [...state.blueFaction.downedPilots, ...state.redFaction.downedPilots];

		Object.entries(downedPilotMarkers).forEach(([id, marker]) => {
			if (marker == null || pilots.some((pilot) => pilot.id === id)) {
				return;
			} else {
				removeSymbol(marker.marker);
				delete downedPilotMarkers[id];
			}
		});

		cleanupStructures();
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
