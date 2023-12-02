import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition } from "../components";
import { QueryKey } from "../world";
import { Entity } from "./Entity";

export interface UnitProps {
	coalition: DcsJs.Coalition;
}
export class Unit extends Entity implements Coalition {
	public constructor(args: UnitProps & { queries: Set<QueryKey> }) {
		super(args);
	}
}
