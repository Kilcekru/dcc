import * as Types from "@kilcekru/dcc-shared-types";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

if (process.isMainFrame) {
	const _dcc: Types.Capture.IPC = {
		onInitialize: (listener) => {
			const cb = (_e: IpcRendererEvent) => {
				listener();
			};
			ipcRenderer.on("Capture.initialize", cb);
			return () => {
				ipcRenderer.off("Capture.initialize", cb);
			};
		},
		onRequestRender: (listener) => {
			const cb = (_e: IpcRendererEvent, args: string) => {
				listener(JSON.parse(args) as Types.Capture.Document);
			};
			ipcRenderer.on("Capture.requestRender", cb);
			return () => {
				ipcRenderer.off("Capture.requestRender", cb);
			};
		},
	};

	contextBridge.exposeInMainWorld("_dcc", _dcc);
}
