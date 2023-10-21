import * as Types from "@kilcekru/dcc-shared-types";
import { errMsg } from "@kilcekru/dcc-shared-utils";
import { app } from "electron";

import { userConfig } from "../persistance/state";
import { detectPatch } from "./detect";
import { executePatches } from "./execute";

export async function autoPatch() {
	if (!userConfig.data.dcs.available) {
		return;
	}

	if (!userConfig.data.patch.initialized) {
		const enabled = await detectPatch("scriptFileAccess");
		await userConfig.update("patch", { initialized: true, auto: enabled === false ? ["scriptFileAccess"] : [] });
	}

	if (userConfig.data.patch.auto.length === 0) {
		return;
	}
	const execs: Types.Patch.Execution = [];
	for (const id of userConfig.data.patch.auto) {
		if ((await detectPatch(id)) === false) {
			execs.push({ id, action: "apply" });
		}
	}
	try {
		await executePatches(execs);
	} catch (err) {
		console.log(`autoPatch failed: ${errMsg(err)}`); // eslint-disable-line no-console
	}
}

let onQuitStatus: "idle" | "processing" | "done" = "idle";
app.on("will-quit", (e) => {
	if (onQuitStatus === "done") {
		return;
	}
	if (userConfig.data.patch.auto.length === 0) {
		onQuitStatus = "done";
		return;
	}
	e.preventDefault();
	if (onQuitStatus === "processing") {
		return;
	}
	onQuitStatus = "processing";
	autoPatchOnQuit()
		.catch((err) => {
			console.log(`autoPatchOnQuit failed: ${errMsg(err)}`); // eslint-disable-line no-console
		})
		.finally(() => {
			onQuitStatus = "done";
			setImmediate(() => {
				// executePatches might return / reject synchronous, app.quit must not be call synchronous inside 'will-quit'
				app.quit();
			});
		});
});

async function autoPatchOnQuit() {
	const execs: Types.Patch.Execution = [];
	for (const id of userConfig.data.patch.auto) {
		if ((await detectPatch(id)) === true) {
			execs.push({ id, action: "clear" });
		}
	}
	await executePatches(execs);
}
