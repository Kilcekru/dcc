import * as Types from "@kilcekru/dcc-shared-types";
import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

if (process.isMainFrame) {
	const _dcc: Types.Capture.IPC = {
		ready: () => {
			ipcRenderer.send("Capture.ready");
		},
		renderComplete: () => {
			ipcRenderer.send("Capture.renderComplete");
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
