import type * as DcsJs from "@foxdelta2/dcsjs";

import { Events, Serialization } from "../../../utils";
import { MapEntity, MapEntityProps } from "./MapEntity";

export interface GroupProps extends MapEntityProps {
	position: DcsJs.Position;
}

export abstract class Group<EventNames extends keyof Events.EventMap.All = never> extends MapEntity<
	EventNames | keyof Events.EventMap.Group
> {
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
