import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import { app } from "electron";
import FS from "fs-extra";
import { z } from "zod";

import { State } from "./state";

export const userConfig = new State({
	name: "userConfig",
	schema: Types.Core.UserConfigSchema,
	default: {
		version: 2,
		dcs: { available: undefined },
		setupComplete: false,
		downloadsPath: app.getPath("downloads"),
		currentApp: "home",
		patch: { initialized: false, auto: [] },
	},
	migrations: [
		async (): Promise<UserConfigV1> => {
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
		},
		async (value): Promise<Types.Core.UserConfig> => {
			const data = userConfigV1Schema.parse(value);
			return {
				...data,
				version: 2,
				patch: {
					initialized: false,
					auto: [],
				},
			};
		},
	],
});

const userConfigV0Schema = z.object({
	setupComplete: z.boolean().optional(),
	dcs: z
		.discriminatedUnion("available", [
			z.object({
				available: z.literal(false),
			}),
			z.object({
				available: z.literal(true),
				paths: Types.Core.DcsPathsSchema,
			}),
		])
		.optional(),
	downloadsPath: z.string(),
	currentApp: z.enum(["home", "campaign"]).optional(),
});

export const userConfigV1Schema = z.object({
	version: z.literal(1),
	setupComplete: z.boolean(),
	dcs: z.discriminatedUnion("available", [
		z.object({ available: z.undefined() }),
		z.object({
			available: z.literal(false),
		}),
		z.object({
			available: z.literal(true),
			paths: Types.Core.DcsPathsSchema,
		}),
	]),
	downloadsPath: z.string(),
	currentApp: z.enum(["home", "campaign"]),
});
type UserConfigV1 = z.infer<typeof userConfigV1Schema>;
