import type * as DcsJs from "@foxdelta2/dcsjs";

import { Events, Serialization } from "../../../utils";
import { Entity, EntityProps } from "./Entity";

export interface GroupProps extends EntityProps {
	position: DcsJs.Position;
}

export abstract class Group<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.Group
> {
	public position: DcsJs.Position;

	public constructor(args: GroupProps | Serialization.GroupSerialized) {
		super(args);
		this.position = args.position;
	}

	public override serialize(): Serialization.GroupSerialized {
		return {
			...super.serialize(),
			position: this.position,
		};
	}
}
