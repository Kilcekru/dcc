import * as DcsJs from "@foxdelta2/dcsjs";

import { Coalition } from "../components";
import { QueryNames, world } from "../world";

export interface EntityProps {
	coalition: DcsJs.Coalition;
	queries: Array<QueryNames>;
}

export class Entity implements Coalition {
	/**
	 * only reference to global world
	 */
	world = world;
	#queries: Array<QueryNames> = [];
	coalition: DcsJs.Coalition;

	constructor(args: EntityProps) {
		this.coalition = args.coalition;
		this.#queries = args.queries ?? [];

		for (const queryName of this.#queries) {
			const query = this.world.queries[queryName];

			if (query instanceof Set) {
				const q: Set<Entity> = query;
				q.add(this);
			} else {
				const q: Set<Entity> = query[this.coalition];
				q.add(this);
			}
		}
	}

	deconstructor() {
		for (const queryName of this.#queries) {
			const query = this.world.queries[queryName];

			if (query instanceof Set) {
				const q: Set<Entity> = query;
				q.delete(this);
			} else {
				const q: Set<Entity> = query[this.coalition];
				q.delete(this);
			}
		}
	}
}
