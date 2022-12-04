export interface DccWindow extends Window {
	_dcc: {
		rpc: (namespace: string, fnName: string, args: unknown) => Promise<unknown>;
	};
}
declare const window: DccWindow;

export async function executeRpc(namespace: string, fnName: string, args: unknown) {
	return await window._dcc.rpc(namespace, fnName, args ?? []);
}
