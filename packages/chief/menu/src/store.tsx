import * as Types from "@kilcekru/dcc-shared-types";
import { createStore } from "@kilcekru/dcc-lib-components";

import * as IPC from "./ipc";

type MenuState = {
	expanded: boolean;
	config?: Types.AppMenu.Config;
}

export const menuStore = createStore<MenuState>({ expanded: false });

export function setExpanded(expanded: boolean) {
	menuStore.set({ expanded });

	if (expanded) {
		IPC.expand();
	} else {
		IPC.collapse();
	}

	console.log("setExpanded", expanded);
}