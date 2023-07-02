import { z } from "zod";

export interface Misc {
	getVersions: () => Promise<Versions>;
	getUserConfig: () => Promise<UserConfig>;
	getSystemConfig: () => Promise<SystemConfig>;
	loadApp: (name: "home" | "campaign") => Promise<void>;
	openExternalLink: (url: string) => Promise<void>;
}

export interface SystemConfig {
	env: "dev" | "pro";
}

export const DcsPathsSchema = z.object({
	install: z.string(),
	savedGames: z.string(),
});
export type DcsPaths = z.infer<typeof DcsPathsSchema>;

export const UserConfigSchema = z.object({
	version: z.literal(1),
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
});
export type UserConfig = z.infer<typeof UserConfigSchema>;

export interface Versions {
	os: string;
	app: string;
	electron: string;
	node: string;
	chrome: string;
}
