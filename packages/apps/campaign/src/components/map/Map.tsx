import "./Map.less";
import "leaflet/dist/leaflet.css";

import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import L from "leaflet";
import MilSymbol from "milsymbol";
import { createEffect, createSignal, onCleanup, onMount, useContext } from "solid-js";

import { MapPosition } from "../../types";
import { positionToMapPosition } from "../../utils";
import { onWorkerEvent } from "../../worker";
import { CampaignContext } from "../CampaignProvider";

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

type MarkerItem = {
	id: Types.Campaign.Id;
	marker: L.Marker;
	color: string;
	symbolCode: string;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
};

export const MapContainer = () => {
	let mapDiv: HTMLDivElement;
	let workerSubscription: { dispose: () => void } | undefined;
	let getMapPosition: (position: DcsJs.Position) => MapPosition = positionToMapPosition("caucasus");
	let selectedMarker: MarkerItem | undefined;
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const markers: Map<string, MarkerItem> = new Map();
	const circles: Map<string, L.Circle> = new Map();
	const [state, { selectEntity }] = useContext(CampaignContext);
	onMount(() => {
		workerSubscription = onWorkerEvent("mapUpdate", (event: Types.Campaign.WorkerEventMapUpdate) => {
			initializeMap(event.items, event.map);
			onMapUpdate(event.items);
		});
	});

	onCleanup(() => {
		workerSubscription?.dispose();
	});

	function initializeMap(items: Map<string, Types.Campaign.MapItem>, map: DcsJs.MapName) {
		if (leaftletMap() != null) {
			return;
		}

		const [item] = items;

		if (item == null) {
			return;
		}

		getMapPosition = positionToMapPosition(map);

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
				addMarker(id, item);

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

	function addMarker(id: string, item: Types.Campaign.MapItem) {
		const map = leaftletMap();

		if (map == null) {
			return;
		}
		const hostile = item.coalition === "red";
		const domain: "ground" | "air" | "sea" = getDomain(item);
		const isWaypoint = false;
		const color = hostile ? "rgb(255, 31, 31)" : "rgb(0, 193, 255)";
		const unitCode = getUnitCode(item);
		const riseOnHover = false;
		const mapPosition = getMapPosition(item.position);

		const symbolCode = isWaypoint
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

		marker.addEventListener("click", function () {
			selectEntity?.(id);
		});

		markers.set(id, {
			id,
			marker,
			color,
			symbolCode,
			coalition: item.coalition,
			position: item.position,
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
		addMarker(id, item);

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
	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
