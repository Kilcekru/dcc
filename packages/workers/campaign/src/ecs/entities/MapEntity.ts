import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Position } from "../components";
import type { QueryKey } from "../world";
import { Entity } from "./Entity";

export interface GroupProps {
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export abstract class MapEntity extends Entity implements Position {
	public position: DcsJs.Position;

	public constructor(args: GroupProps & { queries: Set<QueryKey> }) {
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
