import * as Types from "@kilcekru/dcc-shared-types";
import { createStore } from "@xstate/store";

import * as IPC from "./ipc";

type MenuState = {
	expanded: boolean;
	config?: Types.AppMenu.Config;
};

export const menuStore = createStore({
	context: { expanded: false } as MenuState,
	on: {
		setExpanded: (context, { expanded }: { expanded: boolean }) => {
			context.expanded = expanded;
		},
		setConfig: (context, { config }: { config: Types.AppMenu.Config }) => {
			context.config = config;
		},
	},
});

export function setExpanded(expanded: boolean) {
	menuStore.trigger.setExpanded({ expanded });

	if (expanded) {
		IPC.expand();
	} else {
		IPC.collapse();
	}
}
