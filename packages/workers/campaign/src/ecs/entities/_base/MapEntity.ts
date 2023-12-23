import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { Entity, EntityProps } from "./Entity";

export interface MapEntityProps extends EntityProps {
	position: DcsJs.Position;
}

export abstract class MapEntity<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.MapEntity
> {
	public position: DcsJs.Position;

	public constructor(args: MapEntityProps | Serialization.MapEntitySerialized) {
		const superArgs: EntityProps | Serialization.EntitySerialized = Serialization.isSerialized(args)
			? args
			: { ...args, queries: ["mapEntities", ...(args.queries ?? [])] };
		super(superArgs);

		this.position = args.position;
	}

	toMapJSON(): Types.Campaign.MapItem {
		return {
			coalition: this.coalition,
			position: this.position,
			type: "unknown",
		};
	}

	public override serialize(): Serialization.MapEntitySerialized {
		return {
			...super.serialize(),
			position: this.position,
		};
	}
}
