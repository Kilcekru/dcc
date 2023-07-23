import * as Types from "@kilcekru/dcc-shared-types";

interface CaptureWindow extends Window {
	_dcc: Types.Capture.IPC;
}
declare const window: CaptureWindow;

export const ready = window._dcc.ready;
export const renderComplete = window._dcc.renderComplete;
export const onRequestRender = window._dcc.onRequestRender;
