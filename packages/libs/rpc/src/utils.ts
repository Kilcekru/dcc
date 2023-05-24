interface DccWindow extends Window {
	_dcc: {
		rpc: (namespace: string, fnName: string, args: unknown) => Promise<unknown>;
		on: (channel: string, listener: (payload: unknown) => void) => () => void;
	};
}
declare const window: DccWindow;

// any is needed here for the 'extends'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rpc<T extends (...args: any[]) => Promise<unknown>>(namespace: string, fnName: string) {
	return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
		const res = await window._dcc.rpc(namespace, fnName, args ?? []);
		return res as Awaited<ReturnType<T>>;
	};
}

export function onEvent(channel: string, listener: (payload: unknown) => void) {
	return window._dcc.on(channel, listener);
}
