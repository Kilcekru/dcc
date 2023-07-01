import * as Utils from "@kilcekru/dcc-shared-utils";
import { z } from "zod";

import { BaseJsonSchema, read, stringify, write } from "../utils";

export class State<Schema extends BaseJsonSchema> {
	#schema: Schema;
	#default: z.infer<Schema>;
	#fileName: string;
	#data: z.infer<Schema> | undefined;
	#migrations: Migrations | undefined;

	constructor(options: StateOptions<Schema>) {
		this.#schema = options.schema;
		this.#default = options.default;
		this.#fileName = `${options.name}.json`;
		this.#migrations = options.migrations;
	}

	public get data(): z.infer<Schema> {
		if (this.#data == undefined) {
			throw new Error("Persistance.State data has been accessed before it was loaded");
		}
		return this.#data;
	}

	public set data(data: z.infer<Schema>) {
		this.#data = data;
	}

	public reset(): void {
		if (this.#data == undefined) {
			throw new Error("Persistance.State reset has been called before it was loaded");
		}
		this.#data = structuredClone(this.#default);
	}

	public async load(): Promise<void> {
		let data: unknown;
		try {
			data = JSON.parse(
				await read({
					namespace: "state",
					fileName: this.#fileName,
				})
			);
			this.#data = this.#schema.parse(data);
		} catch {
			if (this.#migrations != undefined) {
				try {
					let version = Utils.hasKey(data, "version", "number") && Number.isFinite(data.version) ? data.version : 0;
					while (version < this.#migrations.length) {
						const migration = this.#migrations[version];
						if (migration != undefined) {
							data = await migration(data);
						}
						version++;
					}
					this.#data = this.#schema.parse(data);
					await this.save();
					return;
				} catch (err) {
					console.error(`Persistance.State migration failed: ${Utils.errMsg(err)}`); // eslint-disable-line no-console
				}
			}
			this.#data = structuredClone(this.#default);
			await this.save();
		}
	}

	public async save(): Promise<void> {
		if (this.#data == undefined) {
			throw new Error("Persistance.State save has been called before it was loaded");
		}
		try {
			await write({
				namespace: "state",
				fileName: this.#fileName,
				data: stringify(this.#data),
			});
		} catch (err) {
			console.error(`Persistance.State save failed: ${Utils.errMsg(err)}`); // eslint-disable-line no-console
		}
	}
}

type Migrations = Array<(data: unknown) => Promise<unknown> | unknown>;

interface StateOptions<Schema extends BaseJsonSchema> {
	schema: Schema;
	default: z.infer<Schema>;
	name: string;
	migrations?: Migrations;
}
