import { contextBridge, ipcRenderer } from "electron";

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
});

window.addEventListener("contextmenu", async (e) => {
	e.preventDefault();
	await ipcRenderer.invoke("contextMenu", JSON.stringify({ x: e.x, y: e.y }));
});
