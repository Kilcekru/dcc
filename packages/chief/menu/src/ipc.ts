import * as Types from "@kilcekru/dcc-shared-types";

interface MenuWindow extends Window {
	_dcc: Types.AppMenu.IPC;
}
declare const window: MenuWindow;

export const getConfig = window._dcc.getConfig;
export const handleAction = window._dcc.handleAction;
export const onConfigChanged = window._dcc.onConfigChanged;
export const expand = window._dcc.expand;
export const collapse = window._dcc.collapse;
