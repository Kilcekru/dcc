import { initHotkeys } from "./hotkeys";
import { setupIpc } from "./ipc";

export function initialize() {
	setupIpc();
	initHotkeys();
}
