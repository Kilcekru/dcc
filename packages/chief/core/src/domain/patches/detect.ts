import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import FS from "fs-extra";

import { userConfig } from "../persistance/state";
import { patchesConfig } from "./config";
import { createLineRegex } from "./utils";

/** Detect if a patch is applied
 * @returns true if patch is applied, false if patch is not applied, undefined if state can't be detected
 */
export async function detectPatch(id: Types.Patch.Id): Promise<boolean | null> {
	try {
		if (!userConfig.data.dcs.available) {
			return null;
		}

		const patch = patchesConfig[id];
		const path = Path.join(userConfig.data.dcs.paths.install, patch.path);
		const content = await FS.readFile(path, "utf-8");
		const applied: Array<boolean | undefined> = [];
		for (const replacement of patch.replace ?? []) {
			if (createLineRegex(replacement.search).test(content)) {
				applied.push(false);
			} else if (createLineRegex(replacement.substitute).test(content)) {
				applied.push(true);
			} else {
				return null;
			}
		}
		if (applied.every((e) => e === false)) {
			return false;
		} else if (applied.every((e) => e === true)) {
			return true;
		}
		return null;
	} catch (err) {
		return null;
	}
}
