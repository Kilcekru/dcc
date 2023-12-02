import { Coalition, Position } from "../components";
import { QueryName } from "../world";
import { Aircraft } from "./Aircraft";
import { MapEntity } from "./MapEntity";

export type HomeBaseType = "airdrome" | "carrier" | "farp";

export interface HomeBaseProps extends Coalition, Position {
	name: string;
	type: HomeBaseType;
}

export class HomeBase extends MapEntity implements Coalition {
	name: string;
	type: HomeBaseType;
	aircrafts: Set<Aircraft> = new Set();

	public constructor(args: HomeBaseProps & { queries: Set<QueryName> }) {
		super({
			coalition: args.coalition,
			queries: args.queries,
			position: args.position,
		});
		this.name = args.name;
		this.type = args.type;
		this.coalition = args.coalition;
		this.position = args.position;
	}

	override toJSON() {
		return {
			...super.toJSON(),
			name: this.name,
			type: this.type,
			aircrafts: Array.from(this.aircrafts).map((aircraft) => aircraft.id),
		};
	}
}
