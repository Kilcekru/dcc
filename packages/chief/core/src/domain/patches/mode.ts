import * as Types from "@kilcekru/dcc-shared-types";

import { userConfig } from "../persistance/state";
import { detectPatch } from "./detect";
import { executePatches } from "./execute";

export async function getPatchMode(id: Types.Patch.Id): Promise<Types.Patch.Mode | null> {
	const enabled = await detectPatch(id);
	if (enabled == null) {
		return null;
	}
	return userConfig.data.patch.auto.includes(id) ? "auto" : enabled === true ? "enabled" : "disabled";
}

export async function setPatchModes(patches: Types.Patch.SetMode) {
	const execs: Types.Patch.Execution = [];

	const autoPatch = new Set(userConfig.data.patch.auto);
	for (const patch of patches) {
		const enabled = await detectPatch(patch.id);
		if (enabled == null) {
			throw new Error(`Could not detect state of patch ${patch.id}`);
		}

		if (patch.mode === "auto") {
			autoPatch.add(patch.id);
		} else {
			autoPatch.delete(patch.id);
		}

		if (patch.mode === "auto" || patch.mode === "enabled") {
			if (enabled === false) {
				execs.push({ id: patch.id, action: "apply" });
			}
		}
		if (patch.mode === "disabled") {
			if (enabled === true) {
				execs.push({ id: patch.id, action: "clear" });
			}
		}
	}
	await userConfig.update("patch", (value) => ({ ...value, auto: [...autoPatch] }));
	await executePatches(execs);
}
