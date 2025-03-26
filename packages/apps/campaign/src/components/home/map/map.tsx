import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { Map as MaplibreMap, Marker } from "@vis.gl/react-maplibre";
import * as DcsJs from "@foxdelta2/dcsjs";
import { LOtoLL } from "@kilcekru/dcs-coordinates";
import { campaignStore } from "../../../stores/campaign";
import { useStore } from "@kilcekru/dcc-lib-components";
import { onWorkerEvent, Triggers } from "../../../worker";
import * as Types from "@kilcekru/dcc-shared-types";
import MilSymbol from "milsymbol";
import { getMilSymbolCode } from "./unit-code";
import { entityDrawerStore } from "../../../stores/entity-drawer";

type MapPosition = [number, number];

export const positionToMapPosition =
	(theatre: DcsJs.Theatre) =>
	(pos: { x: number; y: number }): MapPosition => {
		console.log(theatre, pos);
		try {
			// TODO: Remove this once we have a proper map origin for Afghanistan
			if (theatre === "Afghanistan") {
				throw new Error("Afghanistan is not supported");
			}
			const latLng = LOtoLL({ theatre, x: pos.x, z: pos.y });

			return [latLng.lat, latLng.lng];
		} catch (e: unknown) {
			// eslint-disable-next-line no-console
			console.error(e, pos);
			throw new Error("invalid map position");
		}
	};

const Entity = memo(function Entity(props: {
	entity: Types.Campaign.MapItem;
	getMapPosition: (pos: { x: number; y: number }) => MapPosition;
}) {
	const position = useMemo(() => {
		try {
			return props.getMapPosition(props.entity.position);
		} catch (e) {
			console.error(e);
			return undefined;
		}
	}, [props.entity.position, props.getMapPosition]);
	const symbol = useMemo(() => {
		const symbol = new MilSymbol.Symbol(getMilSymbolCode(props.entity), {
			size: 20,
		});
		return symbol.asSVG();
	}, [props.entity]);

	return position == null ? null : (
		<Marker
			longitude={position[1]}
			latitude={position[0]}
			color={props.entity.coalition === "blue" ? "blue" : "red"}
			onClick={() => {
				console.log(props.entity);
				entityDrawerStore.set({ entityId: props.entity.id });
			}}
			className="cursor-pointer"
		>
			<div dangerouslySetInnerHTML={{ __html: symbol }} />
		</Marker>
	);
});

export function Map() {
	const theatre = useStore(campaignStore, (state) => state.campaign?.theatre ?? "Caucasus");
	const getMapPosition = useMemo(() => positionToMapPosition(theatre), [theatre]);
	const [entities, setEntities] = useState<Types.Campaign.MapItem[]>([]);
	const [viewState, setViewState] = React.useState({
		longitude: -100,
		latitude: 40,
		zoom: 7,
	});

	useEffect(() => {
		const centerPosition = getMapPosition(DcsJs.Theatres[theatre].info.center);
		setViewState({
			longitude: centerPosition[1],
			latitude: centerPosition[0],
			zoom: 7,
		});

		// The first map update needs to be triggered manually
		Triggers.getMapUpdate();
	}, []);

	useEffect(() => {
		const workerSubscription = onWorkerEvent("mapUpdate", (event: Types.Campaign.WorkerEventMapUpdate) => {
			setEntities(new Array(...event.items.values()));
		});

		return () => {
			workerSubscription.dispose();
		};
	});

	return (
		<div className="w-full h-full flex-1 flex">
			<MaplibreMap
				{...viewState}
				onMove={(e) => setViewState(e.viewState)}
				style={{ flex: 1 }}
				mapStyle="https://api.maptiler.com/maps/openstreetmap/style.json?key=dMqlZfgU5XToBXt4BGnm"
			>
				{entities.map((entity) => (
					<Entity key={entity.id} entity={entity} getMapPosition={getMapPosition} />
				))}
			</MaplibreMap>
		</div>
	);
}
