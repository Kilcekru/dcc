import * as DcsJs from "@foxdelta2/dcsjs";

import { Position } from "../components";
import { QueryNames } from "../world";
import { MapEntity } from "./MapEntity";

export interface GroupProps {
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export class Group extends MapEntity implements Position {
	public constructor(args: GroupProps & { queries: Array<QueryNames> }) {
		super(args);
	}
}
