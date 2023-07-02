import * as Path from "node:path";

import { app } from "electron";
import FS from "fs-extra";
import { z } from "zod";

import { config } from "../../config";

type Namespace = "state" | "json" | "file" | "multi";

export function getBasePath(namespace: Namespace) {
	return Path.join(app.getPath("userData"), "persistance", namespace);
}

export interface FileArgs {
	namespace: Namespace;
	fileName: string;
	ignoreError?: boolean;
}

export type WriteArgs = FileArgs & { data: string };

/**
 * Writes a file
 *
 * File is written to a tmp file and renamed when write is finished.\
 * This prevents file corruption if process crashed during writing.
 *
 * @returns boolean - success
 */
export async function write(args: WriteArgs): Promise<boolean> {
	try {
		const fileName = fileNameSchema.parse(args.fileName);
		const filePath = Path.join(app.getPath("userData"), "persistance", args.namespace, fileName);
		const tmpPath = `${filePath}.tmp`;
		await FS.outputFile(tmpPath, args.data);
		await FS.rename(tmpPath, filePath);
		return true;
	} catch (err) {
		if (!args.ignoreError) {
			throw err;
		}
	}
	return false;
}

/**
 * Reads a file
 *
 * @returns string - file content
 */
export async function read(args: FileArgs & { ignoreError: true }): Promise<string | undefined>;
export async function read(args: FileArgs): Promise<string>;
export async function read(args: FileArgs): Promise<string | undefined> {
	try {
		const fileName = fileNameSchema.parse(args.fileName);
		const filePath = Path.join(app.getPath("userData"), "persistance", args.namespace, fileName);
		return await FS.readFile(filePath, { encoding: "utf-8" });
	} catch (err) {
		if (!args.ignoreError) {
			throw err;
		}
		return undefined;
	}
}

export async function remove(args: FileArgs): Promise<boolean> {
	try {
		const fileName = fileNameSchema.parse(args.fileName);
		const filePath = Path.join(app.getPath("userData"), "persistance", args.namespace, fileName);
		await FS.remove(filePath);
		return true;
	} catch (err) {
		if (!args.ignoreError) {
			throw err;
		}
		return false;
	}
}

export function stringify(data: unknown): string {
	return config.env === "dev" ? JSON.stringify(data, undefined, "\t") : JSON.stringify(data);
}

const fileNameSchema = z
	.string()
	.max(100, "Filename must be shorter than 100 characters")
	.regex(
		/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.[a-z0-9]{1,5}$/i,
		"Filename may only contain 'a-z0-9_-', must have an extension (1-5 chars), fileName and dirNames must me at least 1 char"
	);

export type BaseJsonSchema = z.ZodObject<{ version: z.ZodNumber }>;
