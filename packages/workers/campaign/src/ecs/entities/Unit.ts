import { Entity, EntityProps } from "./Entity";

export type UnitProps = EntityProps;
export abstract class Unit extends Entity {
	public constructor(args: UnitProps) {
		super(args);
	}
}
