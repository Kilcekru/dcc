import type * as DcsJs from "@foxdelta2/dcsjs";

import { Events } from "../../utils";
import type { QueryKey } from "../world";
import { Entity } from "./Entity";

export interface GroupProps {
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export class Group<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.Group
> {
	public position: DcsJs.Position;

	public constructor(args: GroupProps & { queries: Set<QueryKey> }) {
		super(args);
		this.position = args.position;
	}
}
