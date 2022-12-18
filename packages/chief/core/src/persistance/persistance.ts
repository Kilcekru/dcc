import * as Path from "node:path";

import { app } from "electron";
import FS from "fs-extra";

interface PersistanceOptions {
	path: string;
}

export class Persistance<T> {
	#path: string;
	#tmp: string;
	#data: Partial<T>;

	constructor(options: PersistanceOptions) {
		this.#tmp = Path.join(app.getPath("userData"), "persistance", `${options.path}.tmp.json`);
		this.#path = Path.join(app.getPath("userData"), "persistance", `${options.path}.json`);
		this.#data = {};
	}

	public get data() {
		return this.#data;
	}

	public set data(newData: Partial<T>) {
		this.#data = newData;
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
