import { Entity } from "./entities";

export type Listener<T> = (item: T) => void;
export type Subscription = {
	dispose: () => void;
};

export class SuperSet<T extends Entity, SubSet extends string> extends Set<T> {
	#subSets: Record<SubSet, Set<T>>;
	#listeners: Set<Listener<Set<T>>> = new Set();

	public constructor(subSets: Array<SubSet>) {
		super();

		this.#subSets = {} as Record<SubSet, Set<T>>;

		for (const subSet of subSets) {
			this.#subSets[subSet] = new Set();
		}
	}

	static create<T extends Entity>(subSets: Array<string>) {
		return new SuperSet<T, (typeof subSets)[number]>(subSets);
	}

	public override add(item: T, subSets?: Array<SubSet>) {
		super.add(item);

		subSets?.forEach((subSet) => {
			this.#subSets[subSet]?.add(item);
		});

		this.#notify();

		return this;
	}

	public override delete(item: T) {
		const retVal = super.delete(item);

		for (const subSet of Object.values<Set<T>>(this.#subSets)) {
			subSet.delete(item);
		}

		this.#notify();

		return retVal;
	}

	public override clear() {
		super.clear();

		for (const subSet of Object.values<Set<T>>(this.#subSets)) {
			subSet.clear();
		}

		this.#notify();
	}

	public override has(item: T, subSet?: SubSet) {
		if (subSet == null) {
			return super.has(item);
		}

		return this.#subSets[subSet].has(item);
	}

	public override values(subSet?: SubSet) {
		if (subSet == null) {
			return super.values();
		}

		return this.#subSets[subSet].values();
	}

	public override keys(subSet?: SubSet) {
		if (subSet == null) {
			return super.keys();
		}

		return this.#subSets[subSet].keys();
	}

	public override entries(subSet?: SubSet) {
		if (subSet == null) {
			return super.entries();
		}

		return this.#subSets[subSet].entries();
	}

	public override forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, subSet?: SubSet) {
		if (subSet == null) {
			return super.forEach(callbackfn);
		}

		return this.#subSets[subSet].forEach(callbackfn);
	}

	public sizeOf(subSet?: SubSet) {
		if (subSet == null) {
			return super.size;
		}

		return this.#subSets[subSet].size;
	}

	public subscribe(listener: Listener<Set<T>>): Subscription {
		this.#listeners.add(listener);

		return {
			dispose: () => this.#listeners.delete(listener),
		};
	}

	public get(subSet: SubSet): Set<T> {
		const s = this.#subSets[subSet];

		if (s == null) {
			throw new Error(`SuperSet: subSet ${subSet ?? ""} not found`);
		}

		return s;
	}

	public moveSubSet(item: T, from: SubSet, to: SubSet) {
		this.#subSets[from].delete(item);
		this.#subSets[to].add(item);
	}

	public difference(other: Set<Entity>, subSet?: SubSet) {
		const retVal = new Set<T>();

		const a = subSet == null ? this : this.#subSets[subSet];

		for (const item of a) {
			if (!other.has(item)) {
				retVal.add(item);
			}
		}

		return retVal;
	}

	public intersection(other: Set<Entity>, subSet?: SubSet) {
		const retVal = new Set<T>();

		const a = subSet == null ? this : this.#subSets[subSet];

		for (const item of a) {
			if (other.has(item)) {
				retVal.add(item);
			}
		}

		return retVal;
	}

	#notify() {
		for (const listener of this.#listeners) {
			listener(this);
		}
	}
}
