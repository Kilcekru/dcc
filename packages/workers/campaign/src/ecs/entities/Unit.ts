import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition } from "../components";
import { QueryNames } from "../world";
import { Entity } from "./Entity";

export interface UnitProps {
	coalition: DcsJs.Coalition;
}
export class Unit extends Entity implements Coalition {
	public constructor(args: UnitProps & { queries: Array<QueryNames> }) {
		super(args);
	}
}
