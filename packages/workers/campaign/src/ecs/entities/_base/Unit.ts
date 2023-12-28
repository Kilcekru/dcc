import * as Types from "@kilcekru/dcc-shared-types";

import { Events } from "../../../utils";
import { Entity, EntityProps } from "./Entity";

export type UnitProps = EntityProps;
export abstract class Unit<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.Unit
> {
	#alive = true;

	get alive() {
		return this.#alive;
	}

	public constructor(args: UnitProps) {
		super(args);
	}

	destroy() {
		this.#alive = false;
	}

	public override serialize(): Types.Serialization.UnitSerialized {
		return {
			...super.serialize(),
			alive: this.#alive,
		};
	}
}
