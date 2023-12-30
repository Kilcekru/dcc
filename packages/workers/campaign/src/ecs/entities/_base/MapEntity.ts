import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { Entity, EntityProps } from "./Entity";

export interface MapEntityProps extends EntityProps {
	position: DcsJs.Position;
	name: string;
}

export abstract class MapEntity<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.MapEntity
> {
	readonly name: string;
	public position: DcsJs.Position;
	#hidden = false;

	protected set hidden(value: boolean) {
		this.#hidden = value;
	}

	public get hidden() {
		return this.#hidden;
	}

	public constructor(args: MapEntityProps | Types.Serialization.MapEntitySerialized) {
		const superArgs: EntityProps | Types.Serialization.EntitySerialized = Serialization.isSerialized(args)
			? args
			: { ...args, queries: ["mapEntities", ...(args.queries ?? [])] };
		super(superArgs);

		this.name = args.name;
		this.position = args.position;

		if (Serialization.isSerialized(args)) {
			this.#hidden = args.hidden;
		}
	}

	toMapJSON(): Types.Campaign.MapItemBase {
		return {
			coalition: this.coalition,
			position: this.position,
			id: this.id,
			name: this.name,
		};
	}

	public override serialize(): Types.Serialization.MapEntitySerialized {
		return {
			...super.serialize(),
			position: this.position,
			name: this.name,
			hidden: this.#hidden,
		};
	}
}
