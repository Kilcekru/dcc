import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition } from "../components";

export interface UnitProps {
	coalition: DcsJs.Coalition;
}
export class Unit implements Coalition {
	public coalition: DcsJs.Coalition;

	public constructor(args: UnitProps) {
		this.coalition = args.coalition;
	}
}
