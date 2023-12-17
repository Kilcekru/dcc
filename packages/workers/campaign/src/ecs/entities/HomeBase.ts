import * as DcsJs from "@foxdelta2/dcsjs";

import { type QueryName, world } from "../world";
import type { Aircraft } from "./Aircraft";
import { EntityId } from "./Entity";
import { MapEntity } from "./MapEntity";

export type HomeBaseType = "airdrome" | "carrier" | "farp";

export interface HomeBaseProps {
	name: string;
	type: HomeBaseType;
	coalition: DcsJs.Coalition;
	position: DcsJs.Position;
}

export class HomeBase extends MapEntity {
	public readonly name: string;
	public readonly type: HomeBaseType;
	#aircraftIds: Set<EntityId> = new Set();

	get aircrafts(): readonly Aircraft[] {
		const retVal: Aircraft[] = [];

		for (const id of this.#aircraftIds) {
			const aircraft = world.getEntity<Aircraft>(id);

			retVal.push(aircraft);
		}

		return retVal;
	}

	public constructor(args: HomeBaseProps & { queries: Set<QueryName> }) {
		super({
			coalition: args.coalition,
			queries: args.queries,
			position: args.position,
		});
		this.name = args.name;
		this.type = args.type;
	}

	public addAircraft(aircraft: Aircraft) {
		this.#aircraftIds.add(aircraft.id);
	}

	public removeAircraft(aircraft: Aircraft) {
		this.#aircraftIds.delete(aircraft.id);
	}

	override toJSON() {
		return {
			...super.toJSON(),
			name: this.name,
			type: this.type,
			aircrafts: Array.from(this.#aircraftIds),
		};
	}
}
