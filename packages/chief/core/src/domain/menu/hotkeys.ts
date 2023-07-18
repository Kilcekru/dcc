import { Menu, MenuItemConstructorOptions } from "electron";

import { actions } from "./actions";
import { getConfig } from "./config";

export function initHotkeys() {
	const { menu } = getConfig();

	const template: MenuItemConstructorOptions[] = [];

	for (const item of menu) {
		if (item.disabled || item.hidden) {
			continue;
		}
		for (const entry of item.submenu) {
			if (entry.type === "separator" || entry.disabled || entry.hidden) {
				continue;
			}
			for (const hotykey of entry.hotkeys ?? []) {
				template.push({
					label: entry.label,
					accelerator: hotykey,
					click: () => actions[entry.action](),
				});
			}
		}
	}

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
