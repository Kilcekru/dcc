import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

import { Coalition } from "../components";
import { SuperSet } from "../SuperSet";
import { QueryKey, QueryName, world } from "../world";

export interface EntityProps {
	coalition: DcsJs.Coalition;
	queries: Set<QueryKey>;
}

export class Entity implements Coalition {
	/**
	 * only reference to global world
	 */
	world = world;
	#queries: Set<QueryKey> = new Set();
	coalition: DcsJs.Coalition;
	id: string;

	constructor(args: EntityProps) {
		this.id = crypto.randomUUID();
		this.coalition = args.coalition;
		this.#queries = args.queries ?? [];

		for (const queryKey of this.#queries) {
			this.addToQuery(queryKey);
		}
	}

	addToQuery(key: QueryKey) {
		const [name, subSet] = key.split("-");
		const query = this.world.queries[name as QueryName];
		this.#queries.add(key);

		if (query instanceof SuperSet) {
			query.add(this, [subSet]);
		} else if (query instanceof Set) {
			const q: Set<Entity> = query;
			q.add(this);
		} else {
			const q: Set<Entity> = query[this.coalition];

			if (q instanceof SuperSet) {
				q.add(this, [subSet]);
			} else {
				q.add(this);
			}
		}
	}

	deconstructor() {
		for (const queryName of this.#queries) {
			this.removeFromQuery(queryName);
		}
	}

	removeFromQuery(key: QueryKey) {
		const [name] = key.split("-");
		this.#queries.delete(key);

		const query = this.world.queries[name as QueryName];

		if (query instanceof Set) {
			const q: Set<Entity> = query;
			q.delete(this);
		} else if (query instanceof SuperSet) {
			query.delete(this);
		} else {
			const q: Set<Entity> = query[this.coalition];
			q.delete(this);
		}
	}

	#getQuery(name: QueryName) {
		const query = this.world.queries[name];
		if (query instanceof SuperSet) {
			return query;
		} else if (query instanceof Set) {
			const q: Set<Entity> = query;

			return q;
		} else {
			const cQuery = query[this.coalition];

			if (cQuery instanceof SuperSet) {
				return cQuery;
			} else {
				const q: Set<Entity> = cQuery;

				return q;
			}
		}
	}

	moveSubQuery(base: QueryName, from: string, to: string) {
		this.#queries.delete(`${base}-${from}`);
		this.#queries.add(`${base}-${to}`);

		const query = this.#getQuery(base);

		if (query instanceof SuperSet) {
			query.moveSubSet(this, from, to);
		}
	}

	toJSON(): Types.Campaign.EntityItem {
		return {
			coalition: this.coalition,
			id: this.id,
		};
	}
}
