import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition, Position } from "../components";
import { Aircraft } from "./Aircraft";

export type HomeBaseType = "airdrome" | "carrier" | "farp";

export interface HomeBaseProps extends Coalition, Position {
	name: string;
	type: HomeBaseType;
}

export class HomeBase implements Coalition {
	name: string;
	type: HomeBaseType;
	aircrafts: Set<Aircraft> = new Set();
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;

	public constructor(args: HomeBaseProps) {
		this.name = args.name;
		this.type = args.type;
		this.coalition = args.coalition;
		this.position = args.position;
	}
}
