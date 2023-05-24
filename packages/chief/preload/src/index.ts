import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

contextBridge.exposeInMainWorld("_dcc", {
	rpc: async (namespace: string, fnName: string, fnArgs: unknown): Promise<unknown> => {
		const result = (await ipcRenderer.invoke("rpc", JSON.stringify({ namespace, fnName, fnArgs: fnArgs }))) as unknown;
		if (result === undefined) {
			return undefined;
		}
		if (typeof result !== "string") {
			throw new Error("Invalid RPC call: Response not stringified");
		}
		return JSON.parse(result) as unknown;
	},
	on: (channel: string, listener: (payload: unknown) => void): (() => void) => {
		const cb = (_e: IpcRendererEvent, args: unknown) => {
			if (args != undefined && typeof args !== "string") {
				throw new Error("Invalid Event: Response not stringified");
			}
			const payload: unknown = args == undefined ? undefined : JSON.parse(args);
			listener(payload);
		};

		ipcRenderer.on(channel, cb);
		return () => {
			ipcRenderer.off(channel, cb);
		};
	},
});

window.addEventListener("contextmenu", async (e) => {
	e.preventDefault();
	await ipcRenderer.invoke("contextMenu", JSON.stringify({ x: e.x, y: e.y }));
});
