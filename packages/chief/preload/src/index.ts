import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("_dcc", {
	rpc: async (namespace: string, fnName: string, fnArgs: unknown): Promise<unknown> => {
		return (await ipcRenderer.invoke("rpc", { namespace, fnName, fnArgs })) as unknown;
	},
});
