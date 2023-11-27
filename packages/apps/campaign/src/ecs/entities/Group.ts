import * as DcsJs from "@foxdelta2/dcsjs";

import { Position } from "../components";
import { Entity } from "./Entity";

export interface GroupProps {
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export class Group extends Entity implements Position {
	public position: DcsJs.Position;

	public constructor(args: GroupProps) {
		super(args);

		this.position = args.position;
	}
}
