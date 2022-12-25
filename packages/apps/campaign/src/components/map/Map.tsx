import "./Map.less";

import L from "leaflet";
import { createEffect } from "solid-js";

export const Map = () => {
	let mapDiv: HTMLDivElement;

	createEffect(() => {
		const map = L.map(mapDiv).setView([41.8115, 41.7824], 8);

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		L.marker([41.8115, 41.7824]).addTo(map);
	});

	return <div class="map" ref={(el) => (mapDiv = el)} />;
};
