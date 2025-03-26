import React, { useEffect } from "react";
import * as IPC from "./ipc";
import { menuStore, setExpanded } from "./store";
import { Menu } from "./menu/menu";

async function loadConfig() {
	const config = await IPC.getConfig();
	menuStore.set({ config });
}

export function App() {
	useEffect(() => {
		loadConfig().catch(console.error);

		const configDisposable = IPC.onConfigChanged((config) => {
			menuStore.set({ config });
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
