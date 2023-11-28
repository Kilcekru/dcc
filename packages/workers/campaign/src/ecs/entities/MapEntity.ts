import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Position } from "../components";
import { QueryNames } from "../world";
import { Entity } from "./Entity";

export interface GroupProps {
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export class MapEntity extends Entity implements Position {
	public position: DcsJs.Position;

	public constructor(args: GroupProps & { queries: Array<QueryNames> }) {
		super({
			coalition: args.coalition,
			queries: (args.queries ?? []).concat(["mapEntities"]),
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
