import "./Map.less";
import "leaflet/dist/leaflet.css";

import * as Types from "@kilcekru/dcc-shared-types";
import L from "leaflet";
import MilSymbol from "milsymbol";
import { createSignal, onCleanup, onMount } from "solid-js";

import { usePositionToMapPosition } from "../../utils";
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
		let unitCode: SidcUnitCodeKey = "installation";

		switch (item.structureType) {
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

		return unitCode;
	} else if (item.type === "airdrome") {
		return "airport";
	} else {
		return "waypoint";
	}
}

function getDomain(item: Types.Campaign.MapItem): "air" | "ground" | "sea" {
	switch (item.type) {
		case "structure":
		case "airdrome":
			return "ground";
		default:
			return "sea";
	}
}

export const MapContainer = () => {
	let mapDiv: HTMLDivElement;
	let workerSubscription: { dispose: () => void } | undefined;
	const [leaftletMap, setMap] = createSignal<L.Map | undefined>(undefined);
	const markers: Map<string, L.Marker | L.Circle | L.CircleMarker | L.Polyline> = new Map();
	const positionToMapPosition = usePositionToMapPosition();

	onMount(() => {
		workerSubscription = onWorkerEvent("mapUpdate", (event: Types.Campaign.WorkerEventMapUpdate) => {
			onMapUpdate(event.items);
		});
	});

	onCleanup(() => {
		workerSubscription?.dispose();
	});

	function initializeMap(items: Map<string, Types.Campaign.MapItem>) {
		const [item] = items;

		if (item == null) {
			return;
		}

		const firstPosition = positionToMapPosition(item[1].position);

		const m = L.map(mapDiv).setView(firstPosition, 8);

		// Create Tile Layer
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(m);

		setMap(m);
	}

	function onMapUpdate(items: Map<string, Types.Campaign.MapItem>) {
		if (leaftletMap() == null) {
			initializeMap(items);
		}

		for (const [id, marker] of markers.entries()) {
			if (items.has(id)) {
				continue;
			}

			deleteMarker(marker);
			markers.delete(id);
		}

		for (const [id, item] of items) {
			if (markers.has(id)) {
				continue;
			}

			addMarker(id, item);
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
		const mapPosition = positionToMapPosition(item.position);

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

		markers.set(id, marker);
	}

	function deleteMarker(marker: L.Marker | L.Circle | L.CircleMarker | L.Polyline | undefined) {
		const map = leaftletMap();

		if (map == null || marker == null) {
			return;
		}

		if (map.hasLayer(marker)) {
			map.removeLayer(marker);
		}
	}

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
