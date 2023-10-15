import * as Persistance from "../persistance";
import { updateCheckComplete } from "../update";
import * as Window from "../window";
import { initHotkeys } from "./hotkeys";
import { onConfigChanged, setupIpc } from "./ipc";

export { onConfigChanged } from "./ipc";

export async function initialize() {
	setupIpc();

	Window.mainWindow.on("maximize", onConfigChanged);
	Window.mainWindow.on("unmaximize", onConfigChanged);
	Persistance.State.userConfig.onChange(onConfigChanged);
	void updateCheckComplete.then(onConfigChanged);

	return await initHotkeys();
}
