import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { SuperSet } from "../SuperSet";
import { QueryKey, QueryName, splitQueryKey, world } from "../world";

export type EntityId = string;

export interface EntityProps {
	coalition: DcsJs.Coalition;
	queries: Set<QueryKey>;
}

export abstract class Entity {
	#queries: Set<QueryKey> = new Set();
	public readonly coalition: DcsJs.Coalition;
	public readonly id: EntityId;

	get queries(): Set<QueryKey> {
		return this.#queries;
	}

	constructor(args: EntityProps) {
		this.id = crypto.randomUUID();
		this.coalition = args.coalition;
		this.#queries = args.queries ?? [];

		world.entities.set(this.id, this);
		for (const queryKey of this.#queries) {
			this.addToQuery(queryKey);
		}
	}

	deconstructor() {
		world.entities.delete(this.id);
		for (const queryName of this.#queries) {
			this.removeFromQuery(queryName);
		}
	}

	addToQuery(key: QueryKey) {
		this.#queries.add(key);
		const [, subSet] = splitQueryKey(key);
		const query = this.#getQuery(key);

		if (query instanceof SuperSet && subSet != undefined) {
			query.add(this, [subSet]);
		} else if (query instanceof Set) {
			query.add(this);
		}
	}

	removeFromQuery(key: QueryKey) {
		this.#queries.delete(key);
		this.#getQuery(key).delete(this);
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

	#getQuery(key: QueryKey): Set<Entity> {
		const [name] = splitQueryKey(key);
		const query = world.queries[name];
		if (query instanceof Set) {
			return query;
		} else {
			return query[this.coalition];
		}
	}
}
