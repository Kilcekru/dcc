import "./Map.less";
import "leaflet/dist/leaflet.css";

import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";
import L from "leaflet";
import MilSymbol from "milsymbol";
import { createSignal, onCleanup, onMount } from "solid-js";

import { MapPosition } from "../../types";
import { positionToMapPosition } from "../../utils";
import { onWorkerEvent } from "../../worker";

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
	if (item.type === "structure") {
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
	} else if (item.type === "airdrome") {
		return "airport";
	} else if (item.type === "flightGroup") {
		switch (item.task) {
			case "CAS":
			case "Pinpoint Strike":
				return "attack";
			case "CSAR":
				return "csar";
			default:
				return "fighter";
		}
	} else if (item.type === "groundGroup") {
		switch (item.groundGroupType) {
			case "infantry":
				return "infantry";
			default:
				return "armor";
		}
		return "armor";
	} else {
		return "waypoint";
	}
}

function getDomain(item: Types.Campaign.MapItem): "air" | "ground" | "sea" {
	switch (item.type) {
		case "structure":
		case "airdrome":
		case "groundGroup":
			return "ground";
		case "flightGroup":
			return "air";
		default:
			return "sea";
	}
}

type MarkerItem = {
	marker: L.Marker;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
};

export const MapContainer = () => {
	let mapDiv: HTMLDivElement;
	let workerSubscription: { dispose: () => void } | undefined;
	let getMapPosition: (position: DcsJs.Position) => MapPosition = positionToMapPosition("caucasus");
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const markers: Map<string, MarkerItem> = new Map();

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
		}

		// Check if any markers need to be added
		for (const [id, item] of items) {
			if (!markers.has(id)) {
				addMarker(id, item);
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

		markers.set(id, {
			marker,
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

	function updatePosition(id: Types.Campaign.Id, item: MarkerItem, position: DcsJs.Position) {
		const mapPosition = getMapPosition(position);

		item.marker.setLatLng?.(mapPosition);
		item.position = position;
	}

	function updateCoalition(id: Types.Campaign.Id, item: Types.Campaign.MapItem) {
		deleteMarker(id, markers.get(id)?.marker);
		addMarker(id, item);
	}
	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
