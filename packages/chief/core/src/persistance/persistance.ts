import * as Path from "node:path";

import { app } from "electron";
import FS from "fs-extra";

interface PersistanceOptions<T> {
	path: string;
	default?: Partial<T>;
}

export class Persistance<T> {
	#path: string;
	#tmp: string;
	#default: Partial<T>;
	#data: Partial<T>;

	constructor(options: PersistanceOptions<T>) {
		this.#tmp = Path.join(app.getPath("userData"), "persistance", `${options.path}.tmp.json`);
		this.#path = Path.join(app.getPath("userData"), "persistance", `${options.path}.json`);
		this.#default = options.default ?? {};
		this.#data = this.#default;
	}

	public get data() {
		return this.#data;
	}

	public set data(newData: Partial<T>) {
		this.#data = newData;
	}

	public reset() {
		this.#data = this.#default;
	}

	public async load() {
		try {
			this.#data = (await FS.readJSON(this.#path)) as Partial<T>;
		} catch (err) {
			// ignore
		}
	}

	public async save(args?: { throwOnErr?: boolean }) {
		try {
			// write to temp file and rename to never have corrupted main file
			await FS.outputJSON(this.#tmp, this.#data, { spaces: "\t" });
			await FS.rename(this.#tmp, this.#path);
		} catch (err) {
			if (args?.throwOnErr) {
				throw err;
			}
		}
	}
}
