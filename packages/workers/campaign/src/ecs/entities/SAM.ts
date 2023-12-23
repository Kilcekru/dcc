import * as DcsJs from "@foxdelta2/dcsjs";

import { MapEntity, MapEntityProps } from "./_base/MapEntity";
import { Objective } from "./Objective";

export interface SAMProps extends Omit<MapEntityProps, "entityType"> {
	name: string;
	objective: Objective;
	range: number;
	type: DcsJs.SamType;
}

export class SAM extends MapEntity {
	public readonly name: string;
	public readonly range: number;
	public readonly objective: Objective;
	public readonly type: DcsJs.SamType;

	private constructor(args: SAMProps) {
		super({ ...args, entityType: "SAM", queries: ["SAMs"] });
		this.name = args.name;
		this.range = args.range;
		this.objective = args.objective;
		this.type = args.type;
	}
}
