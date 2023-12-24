import type * as DcsJs from "@foxdelta2/dcsjs";
import type * as Types from "@kilcekru/dcc-shared-types";

import { Events, Serialization } from "../../../utils";
import { EntityType } from "../../../utils/types";
import { QueryKey, QueryName, splitQueryKey, store } from "../../store";
import { SuperSet } from "../../SuperSet";

export interface EntityProps {
	entityType: EntityType;
	coalition: DcsJs.Coalition;
	queries?: QueryKey[];
}

export abstract class Entity<EventNames extends keyof Events.EventMap.All = never> extends Events.TypedEventEmitter<
	EventNames | keyof Events.EventMap.Entity
> {
	#queries: Set<QueryKey> = new Set();
	public readonly entityType: EntityType;
	public readonly id: Types.Campaign.Id;
	public readonly coalition: DcsJs.Coalition;

	get queries(): Set<QueryKey> {
		return this.#queries;
	}

	constructor(args: EntityProps | Serialization.EntitySerialized) {
		super();
		this.entityType = args.entityType;
		this.coalition = args.coalition;

		if (Serialization.isSerialized(args)) {
			this.id = args.id;
			this.#queries = new Set(args.queries as QueryKey[]);
		} else {
			this.id = crypto.randomUUID();
			this.#queries = new Set(args.queries ?? []);
		}

		store.entities.set(this.id, this);
		for (const queryKey of this.#queries) {
			this.addToQuery(queryKey);
		}
	}

	destructor() {
		this.emit("destructed");
		store.entities.delete(this.id);
		for (const queryName of this.#queries) {
			this.removeFromQuery(queryName);
		}
		this.removeAllListeners();
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

	public serialize(): Serialization.EntitySerialized {
		return {
			serialized: true,
			entityType: this.entityType,
			id: this.id,
			coalition: this.coalition,
			queries: [...this.#queries],
		};
	}

	#getQuery(key: QueryKey): Set<Entity> {
		const [name] = splitQueryKey(key);
		const query = store.queries[name];
		if (query instanceof Set) {
			return query;
		} else {
			return query[this.coalition];
		}
	}
}
