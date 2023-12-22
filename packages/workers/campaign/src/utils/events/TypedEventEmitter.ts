import { All as AllEvents } from "./TypedEvents";

interface TypedEvent<Name, Payload> {
	name: Name;
	payload: Payload;
}

type TypedEventListener<Name, Payload> = (event: TypedEvent<Name, Payload>) => void;

interface ListenerOptions {
	once: boolean;
}

export class TypedEventEmitter<EventNames extends keyof AllEvents> {
	#listenerMap: { [Name in EventNames]?: Map<TypedEventListener<Name, AllEvents[Name]>, ListenerOptions> };

	constructor() {
		this.#listenerMap = {};
	}

	public on<Name extends EventNames>(name: Name, listener: TypedEventListener<Name, AllEvents[Name]>): this {
		let listeners = this.#listenerMap[name];
		if (listeners == undefined) {
			listeners = new Map();
			this.#listenerMap[name] = listeners;
		}
		listeners.set(listener, { once: false });
		return this;
	}

	public once<Name extends EventNames>(name: Name, listener: TypedEventListener<Name, AllEvents[Name]>): this {
		let listeners = this.#listenerMap[name];
		if (listeners == undefined) {
			listeners = new Map();
			this.#listenerMap[name] = listeners;
		}
		listeners.set(listener, { once: true });
		return this;
	}

	public off<Name extends EventNames>(name: Name, listener: TypedEventListener<Name, AllEvents[Name]>): this {
		this.#listenerMap[name]?.delete(listener);
		return this;
	}

	protected emit<Name extends EventNames>(
		...[name, payload]: [name: Name, ...(AllEvents[Name] extends void ? [] : [payload: AllEvents[Name]])]
	): this {
		const listeners = this.#listenerMap[name];
		if (listeners != undefined) {
			for (const [listener, options] of listeners) {
				listener({ name, payload } as TypedEvent<Name, AllEvents[Name]>);
				if (options.once) {
					listeners.delete(listener);
				}
			}
		}
		return this;
	}

	protected removeAllListeners(name?: EventNames): this {
		if (name != undefined) {
			this.#listenerMap[name]?.clear();
		} else {
			this.#listenerMap = {};
		}
		return this;
	}

	public listenerCount(name?: EventNames): number {
		if (name != undefined) {
			return this.#listenerMap[name]?.size ?? 0;
		} else {
			return Object.values(this.#listenerMap as Record<string, Map<unknown, unknown>>).reduce(
				(acc, listeners) => acc + listeners.size,
				0,
			);
		}
	}
}
