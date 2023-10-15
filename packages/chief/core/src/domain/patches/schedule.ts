import * as Types from "@kilcekru/dcc-shared-types";
import { errMsg } from "@kilcekru/dcc-shared-utils";
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
	if (patches.size === 0) {
		onQuitStatus = "done";
		return;
	}
	e.preventDefault();
	if (onQuitStatus === "processing") {
		return;
	}
	onQuitStatus = "processing";
	const execs = [...patches.entries()].map(([id, action]) => ({ id, action }));
	executePatches(execs)
		.catch((err) => console.log(`executePatchOnQuit failed: ${errMsg(err)}`)) // eslint-disable-line no-console
		.finally(() => {
			onQuitStatus = "done";
			setImmediate(() => {
				// executePatches might return / throw synchronous, app.quit must not be call synchronous inside 'will-quit'
				app.quit();
			});
		});
});
