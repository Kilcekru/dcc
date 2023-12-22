import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events } from "../../utils";
import type { QueryKey } from "../world";
import { Entity } from "./Entity";

export interface MapEntityProps {
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export abstract class MapEntity<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.MapEntity
> {
	public position: DcsJs.Position;

	public constructor(args: MapEntityProps & { queries: Set<QueryKey> }) {
		args.queries.add("mapEntities");

		super({
			coalition: args.coalition,
			queries: args.queries,
		});

		this.position = args.position;
	}

	toMapJSON(): Types.Campaign.MapItem {
		return {
			coalition: this.coalition,
			position: this.position,
			type: "unknown",
		};
	}
}
