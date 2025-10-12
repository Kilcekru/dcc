import React, { useEffect } from "react";

import * as IPC from "./ipc";
import { Menu } from "./menu/menu";
import { menuStore } from "./store";

async function loadConfig() {
	const config = await IPC.getConfig();
	menuStore.trigger.setConfig({ config });
}

export function App() {
	useEffect(() => {
		// eslint-disable-next-line no-console
		loadConfig().catch(console.error);

		const configDisposable = IPC.onConfigChanged((config) => {
			menuStore.trigger.setConfig({ config });
		});

		return () => {
			configDisposable();
		};
	}, []);

	return (
		<div className="w-full h-[30px] dark dark:bg-black flex text-white app justify-between">
			<Menu />
			<div>Digital Crew Chief</div>
		</div>
	);
}
