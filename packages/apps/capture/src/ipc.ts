import * as Types from "@kilcekru/dcc-shared-types";

interface CaptureWindow extends Window {
	_dcc: Types.Capture.IPC;
}
declare const window: CaptureWindow;

export const onInitialize = window._dcc.onInitialize;
export const onRequestRender = window._dcc.onRequestRender;
