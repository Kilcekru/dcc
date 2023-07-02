import * as Path from "node:path";

import { app } from "electron";
import FS from "fs-extra";
import { z } from "zod";

import { State } from "./state";

const dccConfigV0Schema = z.object({
	win: z
		.object({
			bounds: z.object({
				width: z.number().int().optional(),
				height: z.number().int().optional(),
				x: z.number().int().optional(),
				y: z.number().int().optional(),
			}),
			maximized: z.boolean().optional(),
		})
		.optional(),
});
const dccConfigV1Schema = z.object({
	version: z.literal(1),
	win: z.object({
		bounds: z.object({
			width: z.number().int(),
			height: z.number().int(),
			x: z.number().int().optional(),
			y: z.number().int().optional(),
		}),
		maximized: z.boolean(),
	}),
});

export const dccConfig = new State({
	name: "dccConfig",
	schema: dccConfigV1Schema,
	default: {
		version: 1,
		win: { bounds: { width: 1280, height: 800 }, maximized: false },
	},
	migrations: [
		async (): Promise<z.infer<typeof dccConfigV1Schema> | undefined> => {
			try {
				const filePath = Path.join(app.getPath("userData"), "persistance/dcc/state.json");
				const fileContent: unknown = await FS.readJSON(filePath);
				const data = dccConfigV0Schema.parse(fileContent);
				await FS.remove(filePath);
				return {
					version: 1,
					win: {
						bounds: {
							width: data.win?.bounds.width ?? 1280,
							height: data.win?.bounds.height ?? 800,
							x: data.win?.bounds.x,
							y: data.win?.bounds.y,
						},
						maximized: data.win?.maximized ?? false,
					},
				};
			} catch {
				return undefined;
			}
		},
	],
});
