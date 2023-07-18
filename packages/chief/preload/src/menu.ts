import * as Types from "@kilcekru/dcc-shared-types";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

if (process.isMainFrame) {
	const _dcc: Types.AppMenu.IPC = {
		getConfig: async () => {
			const result: unknown = await ipcRenderer.invoke("Menu.getConfig");
			if (typeof result !== "string") {
				throw new Error("Invalid IPC call: Response not stringified");
			}
			return JSON.parse(result) as Types.AppMenu.Config;
		},
		handleAction: async (action) => {
			await ipcRenderer.invoke("Menu.handleAction", JSON.stringify({ action }));
		},
		expand: async () => {
			await ipcRenderer.invoke("Menu.expand");
		},
		collapse: async () => {
			await ipcRenderer.invoke("Menu.collapse");
		},
		onConfigChanged: (listener) => {
			const cb = (_e: IpcRendererEvent, args: string) => {
				listener(JSON.parse(args) as Types.AppMenu.Config);
			};
			ipcRenderer.on("Menu.onConfigChanged", cb);
			return () => {
				ipcRenderer.off("Menu.onConfigChanged", cb);
			};
		},
	};

	contextBridge.exposeInMainWorld("_dcc", _dcc);

	window.addEventListener("contextmenu", async (e) => {
		e.preventDefault();
		await ipcRenderer.invoke("Menu.contextMenu", JSON.stringify({ x: e.x, y: e.y }));
	});
}
