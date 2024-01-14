import "./Map.less";
import "leaflet/dist/leaflet.css";

import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import { LOtoLL } from "@kilcekru/dcs-coordinates";
import L from "leaflet";
import MilSymbol from "milsymbol";
import { createEffect, createSignal, onCleanup, onMount, useContext } from "solid-js";

import { onWorkerEvent } from "../../worker";
import { CampaignContext } from "../CampaignProvider";
import { useGetEntity } from "../utils";

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

function getUnitCode(item: Types.Campaign.MapItem): SidcUnitCodeKey {
	switch (item.type) {
		case "structure": {
			switch (item.structureType) {
				case "Fuel Storage":
					return "fuelStorage";
				case "Power Plant":
					return "powerPlant";
				case "Depot":
					return "depot";
				case "Ammo Depot":
					return "ammoDepot";
				case "Hospital":
					return "hospital";
				case "Farp":
					return "militaryBase";
				case "Barrack":
					return "transport";
				default:
					return "installation";
			}
		}
		case "airdrome":
			return "airport";
		case "flightGroup": {
			switch (item.task) {
				case "CAS":
				case "Pinpoint Strike":
					return "attack";
				case "CSAR":
					return "csar";
				default:
					return "fighter";
			}
		}
		case "groundGroup": {
			switch (item.groundGroupType) {
				case "infantry":
					return "infantry";
				default:
					return "armor";
			}
		}
		case "sam":
			return "airDefenceMissle";
		default:
			return "waypoint";
	}
}

function getDomain(item: Types.Campaign.MapItem): "air" | "ground" | "sea" {
	switch (item.type) {
		case "structure":
		case "airdrome":
		case "groundGroup":
		case "sam":
			return "ground";
		case "flightGroup":
			return "air";
		default:
			return "sea";
	}
}

export function usePositionToMapPosition() {
	const [state] = useContext(CampaignContext);
	return positionToMapPosition(state.theatre);
}

export const positionToMapPosition =
	(theatre: DcsJs.Theatre) =>
	(pos: { x: number; y: number }): MapPosition => {
		try {
			const latLng = LOtoLL({ theatre, x: pos.x, z: pos.y });

			return [latLng.lat, latLng.lng];
		} catch (e: unknown) {
			// eslint-disable-next-line no-console
			console.error(e, pos);
			throw new Error("invalid map position");
		}
	};

type MapPosition = [number, number];

type MarkerItem = {
	id: Types.Campaign.Id;
	marker: L.Marker;
	color: string;
	symbolCode: string;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
	item: Types.Campaign.MapItem;
};

export const MapContainer = () => {
	let mapDiv: HTMLDivElement;
	let workerSubscription: { dispose: () => void } | undefined;
	const getMapPosition = usePositionToMapPosition();
	let selectedMarker: MarkerItem | undefined;
	let waypointMarkers: L.Marker[] = [];
	let waypointLine: L.Polyline | undefined;
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const markers: Map<string, MarkerItem> = new Map();
	const circles: Map<string, L.Circle> = new Map();
	const [state, { selectEntity }] = useContext(CampaignContext);
	const getEntity = useGetEntity();

	onMount(() => {
		workerSubscription = onWorkerEvent("mapUpdate", (event: Types.Campaign.WorkerEventMapUpdate) => {
			initializeMap(event.items);
			onMapUpdate(event.items);
		});
	});

	onCleanup(() => {
		workerSubscription?.dispose();
	});

	function initializeMap(items: Map<string, Types.Campaign.MapItem>) {
		if (leaftletMap() != null) {
			return;
		}

		const [item] = items;

		if (item == null) {
			return;
		}

		const firstPosition = getMapPosition(item[1].position);

		const m = L.map(mapDiv).setView(firstPosition, 8);

		// Create Tile Layer
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(m);

		setMap(m);
	}

	function onMapUpdate(items: Map<string, Types.Campaign.MapItem>) {
		// Check if any markers need to be deleted
		for (const [id, item] of markers.entries()) {
			if (items.has(id)) {
				continue;
			}

			deleteMarker(id, item.marker);
			deleteCircle(id);
		}

		// Check if any markers need to be added
		for (const [id, item] of items) {
			if (!markers.has(id)) {
				addMapItemMarker(id, item);

				if (item.type === "sam") {
					addCircle(id, item);
				}

				continue;
			}

			const m = markers.get(id);

			if (m == null) {
				// eslint-disable-next-line no-console
				console.warn("Marker not found");
				continue;
			}

			if (m.position.x !== item.position.x || m.position.y !== item.position.y) {
				updatePosition(id, m, item.position);
			}

			if (m.coalition !== item.coalition) {
				updateCoalition(id, item);
			}
		}

		// Check if any circles need to be updated
		for (const [id, item] of items) {
			if (item.type !== "sam") {
				continue;
			}

			const circle = circles.get(id);

			if (item.active) {
				if (circle == null) {
					addCircle(id, item);
				}
			} else {
				if (circle != null) {
					deleteCircle(id);
				}
			}
		}
	}

	function getSymbolCode(args: {
		unitCode: SidcUnitCodeKey;
		domain: "ground" | "air" | "sea";
		hostile: boolean;
		isWaypoint: boolean;
	}): string {
		return args.isWaypoint
			? `G${args.hostile ? "H" : "F"}C*${sidcUnitCode[args.unitCode]}`
			: `S${args.hostile ? "H" : "F"}${args.domain === "air" ? "A" : args.domain === "sea" ? "S" : "G"}-${
					sidcUnitCode[args.unitCode]
			  }`;
	}
	function addMarker(args: {
		unitCode: SidcUnitCodeKey;
		color: string;
		hostile: boolean;
		domain: "ground" | "air" | "sea";
		isWaypoint: boolean;
		riseOnHover: boolean;
		position: DcsJs.Position;
	}) {
		const mapPosition = getMapPosition(args.position);
		const symbolCode = getSymbolCode(args);
		const symbol = new MilSymbol.Symbol(symbolCode, {
			size: 20,
			...(args.color == null
				? {}
				: {
						iconColor: args.color,
						colorMode: {
							Civilian: args.color,
							Friend: args.color,
							Hostile: args.color,
							Neutral: args.color,
							Unknown: args.color,
						},
				  }),
		});

		const icon = L.icon({
			iconUrl: symbol.toDataURL(),
			iconAnchor: L.point(symbol.getAnchor().x, symbol.getAnchor().y),
		});

		const map = leaftletMap();

		if (map == null) {
			throw new Error("Map not initialized");
		}

		return L.marker(mapPosition, {
			icon,
			riseOnHover: args.riseOnHover,
			zIndexOffset: args.riseOnHover ? 100 : 0,
		}).addTo(map);
	}

	function addMapItemMarker(id: string, item: Types.Campaign.MapItem) {
		const hostile = item.coalition === "red";
		const domain: "ground" | "air" | "sea" = getDomain(item);
		const isWaypoint = false;
		const color = hostile ? "rgb(255, 31, 31)" : "rgb(0, 193, 255)";
		const unitCode = getUnitCode(item);
		const riseOnHover = false;

		const marker = addMarker({
			unitCode,
			color,
			hostile,
			domain,
			isWaypoint,
			riseOnHover,
			position: item.position,
		});

		marker.addEventListener("click", function () {
			selectEntity?.(id);
		});

		markers.set(id, {
			id,
			marker,
			color,
			symbolCode: getSymbolCode({
				unitCode,
				hostile,
				domain,
				isWaypoint,
			}),
			coalition: item.coalition,
			position: item.position,
			item,
		});
	}

	function deleteMarker(id: Types.Campaign.Id, marker: L.Marker | L.Circle | L.CircleMarker | L.Polyline | undefined) {
		const map = leaftletMap();

		if (map == null || marker == null) {
			return;
		}

		if (map.hasLayer(marker)) {
			map.removeLayer(marker);
		}

		markers.delete(id);
	}

	function addCircle(id: Types.Campaign.Id, item: Types.Campaign.SAMMapItem) {
		const map = leaftletMap();

		if (map == null) {
			return;
		}

		const mapPosition = getMapPosition(item.position);

		const circle = L.circle(mapPosition, {
			radius: item.range,
			color: item.coalition === "blue" ? "#80e0ff" : "#ff8080",
		}).addTo(map);

		circles.set(id, circle);
	}

	function deleteCircle(id: Types.Campaign.Id) {
		const circle = circles.get(id);
		if (circle != null) {
			const map = leaftletMap();

			if (map == null) {
				return;
			}

			if (map.hasLayer(circle)) {
				map.removeLayer(circle);
			}

			circles.delete(id);
		}
	}

	function updatePosition(id: Types.Campaign.Id, item: MarkerItem, position: DcsJs.Position) {
		const mapPosition = getMapPosition(position);

		item.marker.setLatLng?.(mapPosition);
		item.position = position;
	}

	function updateCoalition(id: Types.Campaign.Id, item: Types.Campaign.MapItem) {
		deleteMarker(id, markers.get(id)?.marker);
		deleteCircle(id);
		addMapItemMarker(id, item);

		if (item.type === "sam") {
			addCircle(id, item);
		}
	}

	createEffect(function highlightSelectedEntity() {
		if (selectedMarker != null) {
			const symbol = new MilSymbol.Symbol(selectedMarker.symbolCode, {
				size: 20,
				...(selectedMarker.color == null
					? {}
					: {
							iconColor: selectedMarker.color,
							colorMode: {
								Civilian: selectedMarker.color,
								Friend: selectedMarker.color,
								Hostile: selectedMarker.color,
								Neutral: selectedMarker.color,
								Unknown: selectedMarker.color,
							},
					  }),
			});

			selectedMarker.marker.setIcon(
				L.icon({
					iconUrl: symbol.toDataURL(),
					iconAnchor: L.point(symbol.getAnchor().x, symbol.getAnchor().y),
				}),
			);

			selectedMarker = undefined;
		}

		if (state.selectedEntityId == null) {
			return;
		}

		const marker = markers.get(state.selectedEntityId);

		if (marker == null) {
			// eslint-disable-next-line no-console
			console.warn("Marker for selected entity not found");
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
		selectedMarker = marker;
	});

	function deleteWaypoints() {
		if (waypointMarkers.length > 0) {
			for (const waypoint of waypointMarkers) {
				const map = leaftletMap();

				if (map == null) {
					return;
				}

				if (map.hasLayer(waypoint)) {
					map.removeLayer(waypoint);
				}
			}

			waypointMarkers = [];
		}

		if (waypointLine != null) {
			const map = leaftletMap();

			if (map == null) {
				return;
			}

			if (map.hasLayer(waypointLine)) {
				map.removeLayer(waypointLine);
			}

			waypointLine = undefined;
		}
	}
	createEffect(function selectWaypoints() {
		deleteWaypoints();

		const entity = state.selectedEntityId == null ? undefined : getEntity(state.selectedEntityId);

		if (entity?.entityType.includes("FlightGroup")) {
			const flightGroup = entity as Types.Serialization.FlightGroupSerialized;
			const flightPlan = getEntity<Types.Serialization.FlightplanSerialized>(flightGroup.flightplanId);
			const linePoints: MapPosition[] = [];
			const hostile = flightGroup.coalition === "red";
			const color = hostile ? "rgb(255, 31, 31)" : "rgb(0, 193, 255)";

			for (const waypoint of flightPlan.waypoints) {
				const marker = addMarker({
					unitCode: "waypoint",
					color,
					hostile,
					domain: "air",
					isWaypoint: true,
					riseOnHover: false,
					position: waypoint.position,
				});

				marker.bindTooltip(waypoint.name, { permanent: true });

				waypointMarkers.push(marker);
				linePoints.push(getMapPosition(waypoint.position));

				if (waypoint.raceTrack != null) {
					const marker = addMarker({
						unitCode: "waypoint",
						color,
						hostile,
						domain: "air",
						isWaypoint: true,
						riseOnHover: false,
						position: waypoint.raceTrack.position,
					});

					marker.bindTooltip(waypoint.raceTrack.name, { permanent: true });

					waypointMarkers.push(marker);
					linePoints.push(getMapPosition(waypoint.raceTrack.position));
				}
			}

			const map = leaftletMap();

			if (map == null) {
				return;
			}

			waypointLine = L.polyline(linePoints, { color: "#2a2a2a" }).addTo(map);
		}
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
