import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { app } from "electron";
import fetch from "electron-fetch";
import * as semver from "semver";
import { z } from "zod";

import { config } from "../../config";
import * as Domain from "..";

export let updateInfo: Types.Core.UpdateInfo = {
	available: false,
};
let resolveComplete: () => void;
export const updateCheckComplete = new Promise<void>((resolve) => (resolveComplete = resolve));

export async function updateCheck() {
	try {
		const currentVersion = app.getVersion();
		const id = Domain.Persistance.State.dccConfig.data.id;

		const res = await fetch("https://www.digitalcrewchief.at/api/version", {
			headers: {
				"dcc-id": id,
				"dcc-version": currentVersion,
				...(config.env === "dev" ? { "dcc-env": "dev" } : {}),
			},
		});

		if (!res.ok) {
			throw new Error(`Response Status ${res.status}`);
		}

		const body = versionCheckSchema.parse(await res.json());
		updateInfo = {
			available: semver.gt(body.version, currentVersion),
			details: body,
		};
	} catch (err) {
		console.warn(`Update check failed - ${Utils.errMsg(err)}`); // eslint-disable-line no-console
	}
	resolveComplete();
}

const versionCheckSchema = z.object({
	version: z.string(),
	url: z.string(),
});
