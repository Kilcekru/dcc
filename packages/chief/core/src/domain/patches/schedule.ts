import * as Types from "@kilcekru/dcc-shared-types";
import { app } from "electron";

import { executePatches } from "./patches";

const patches = new Map<Types.Patch.Id, Types.Patch.Action>();
let onQuitStatus: "processing" | "done";

export function executePatchOnQuit(id: Types.Patch.Id, action: Types.Patch.Action | "none") {
	if (action === "none") {
		patches.delete(id);
	} else {
		patches.set(id, action);
	}
}

app.on("will-quit", (e) => {
	if (onQuitStatus === "done") {
		return;
	}
	e.preventDefault();
	if (onQuitStatus === "processing") {
		return;
	}
	onQuitStatus = "processing";
	const execs = [...patches.entries()].map(([id, action]) => ({ id, action }));
	executePatches(execs).finally(() => {
		onQuitStatus = "done";
		app.quit();
	});
});
