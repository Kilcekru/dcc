import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition } from "../components";
import { QueryNames, world } from "../world";

export interface EntityProps {
	coalition: DcsJs.Coalition;
}

export class Entity implements Coalition {
	world = world;
	queries: Array<QueryNames> = [];
	coalition: DcsJs.Coalition;

	constructor(args: EntityProps) {
		this.coalition = args.coalition;

		for (const queryName of this.queries) {
			const query = this.world.queries[queryName];

			if (query instanceof Set) {
				query.add(this);
			} else {
				// query[this.coalition].add(this);
			}
		}
	}

	deconstructor() {
		for (const queryName of this.queries) {
			const query = this.world.queries[queryName];

			if (query instanceof Set) {
				query.delete(this);
			} else {
				query[this.coalition];
			}
		}
	}
}
