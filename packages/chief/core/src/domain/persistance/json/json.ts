import { z } from "zod";

import { BaseJsonSchema, read, remove, stringify, write } from "../utils";

export type WriteJsonArgs<Schema extends BaseJsonSchema> = {
	name: string;
	schema: Schema;
	data: z.infer<Schema>;
	ignoreError?: boolean;
};
export async function writeJson<Schema extends BaseJsonSchema>(args: WriteJsonArgs<Schema>): Promise<boolean> {
	try {
		const data = args.schema.parse(args.data) as z.infer<Schema>;
		return await write({
			namespace: "json",
			fileName: `${args.name}.json`,
			data: stringify(data),
			ignoreError: args.ignoreError,
		});
	} catch (err) {
		if (!args.ignoreError) {
			throw err;
		}
		return false;
	}
}

export type ReadJsonArgs<Schema extends BaseJsonSchema> = {
	name: string;
	schema: Schema;
	ignoreError?: boolean;
};

export async function readJson<Schema extends BaseJsonSchema>(
	args: ReadJsonArgs<Schema> & { ignoreError: true }
): Promise<z.infer<Schema> | undefined>;
export async function readJson<Schema extends BaseJsonSchema>(args: ReadJsonArgs<Schema>): Promise<z.infer<Schema>>;
export async function readJson<Schema extends BaseJsonSchema>(
	args: ReadJsonArgs<Schema>
): Promise<z.infer<Schema> | undefined> {
	try {
		const fileContent = await read({
			namespace: "json",
			fileName: `${args.name}.json`,
			ignoreError: args.ignoreError,
		});
		return args.schema.parse(JSON.parse(fileContent)) as z.infer<Schema>;
	} catch (err) {
		if (!args.ignoreError) {
			throw err;
		}
		return undefined;
	}
}

export type RemoveJsonArgs = {
	name: string;
	ignoreError?: boolean;
};

export async function removeJson(args: RemoveJsonArgs): Promise<boolean> {
	try {
		return await remove({
			namespace: "json",
			fileName: `${args.name}.json`,
			ignoreError: args.ignoreError,
		});
	} catch (err) {
		if (!args.ignoreError) {
			throw err;
		}
		return false;
	}
}
