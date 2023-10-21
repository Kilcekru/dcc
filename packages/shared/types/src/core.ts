import { z } from "zod";

import * as Patch from "./patch";
export interface SystemConfig {
	env: "dev" | "pro";
}

export const DcsPathsSchema = z.object({
	install: z.string(),
	savedGames: z.string(),
});
export type DcsPaths = z.infer<typeof DcsPathsSchema>;

export const UserConfigSchema = z.object({
	version: z.literal(2),
	setupComplete: z.boolean(),
	dcs: z.discriminatedUnion("available", [
		z.object({ available: z.undefined() }),
		z.object({
			available: z.literal(false),
		}),
		z.object({
			available: z.literal(true),
			paths: DcsPathsSchema,
		}),
	]),
	downloadsPath: z.string(),
	currentApp: z.enum(["home", "campaign"]),
	patch: z.object({
		initialized: z.boolean(),
		auto: z.array(Patch.idSchema),
	}),
});
export type UserConfig = z.infer<typeof UserConfigSchema>;

export interface Versions {
	os: string;
	app: string;
	electron: string;
	node: string;
	chrome: string;
}

export type AppName = "home" | "campaign";

export type UpdateInfo = {
	available: boolean;
	details?: {
		version: string;
		url: string;
	};
};
