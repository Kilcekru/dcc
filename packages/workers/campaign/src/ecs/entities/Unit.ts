import { Events } from "../../utils";
import { Entity, EntityProps } from "./Entity";

export type UnitProps = EntityProps;
export abstract class Unit<EventNames extends keyof Events.EventMap.All = never> extends Entity<
	EventNames | keyof Events.EventMap.Unit
> {
	public constructor(args: UnitProps) {
		super(args);
	}
}
