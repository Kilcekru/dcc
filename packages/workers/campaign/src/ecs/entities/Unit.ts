import { Coalition } from "../components";
import { Entity, EntityProps } from "./Entity";

export type UnitProps = EntityProps;
export abstract class Unit extends Entity implements Coalition {
	public constructor(args: UnitProps) {
		super(args);
	}
}
