import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import { app } from "electron";
import FS from "fs-extra";
import { z } from "zod";

import { State } from "./state";

const userConfigV0Schema = z.object({
	setupComplete: z.boolean().optional(),
	dcs: z
		.discriminatedUnion("available", [
			z.object({
				available: z.literal(false),
			}),
			z.object({
				available: z.literal(true),
				paths: z.object({
					install: z.string(),
					savedGames: z.string(),
				}),
			}),
		])
		.optional(),
	downloadsPath: z.string(),
	currentApp: z.enum(["home", "campaign"]).optional(),
});

export const userConfig = new State({
	name: "userConfig",
	schema: Types.Core.UserConfigSchema,
	default: {
		version: 1,
		dcs: {
			available: undefined,
		},
		setupComplete: false,
		downloadsPath: app.getPath("downloads"),
		currentApp: "home",
	},
	migrations: [
		async (): Promise<Types.Core.UserConfig | undefined> => {
			try {
				const filePath = Path.join(app.getPath("userData"), "persistance/dcc/userConfig.json");
				const fileContent: unknown = await FS.readJSON(filePath);
				const data = userConfigV0Schema.parse(fileContent);
				await FS.remove(filePath);
				return {
					version: 1,
					setupComplete: data.setupComplete ?? false,
					dcs: data.dcs ?? { available: undefined },
					downloadsPath: data.downloadsPath,
					currentApp: data.currentApp ?? "home",
				};
			} catch {
				return undefined;
			}
		},
	],
});
