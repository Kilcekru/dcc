import { z } from "zod";

import { read, remove, stringify, write } from "./utils";

export class MultiJson<ItemSchema extends BaseItemSchema, SynopsisSchema extends BaseSynopsisSchema> {
	#options: MultiJsonOptions<ItemSchema, SynopsisSchema>;

	public constructor(options: MultiJsonOptions<ItemSchema, SynopsisSchema>) {
		nameSchema.parse(options.name);
		this.#options = options;
	}

	public async list(): Promise<Record<string, z.infer<SynopsisSchema>>> {
		const fileContent = await read({
			namespace: "multi",
			fileName: `${this.#options.name}.json`,
			ignoreError: true,
		});
		if (fileContent == undefined) {
			return {};
		}
		const schema = z.object({
			version: z.number(),
			items: z.record(this.#options.schema.synopsis),
		});
		return schema.parse(JSON.parse(fileContent)).items;
	}

	public async get(id: string) {
		const parsedId = idSchema.parse(id);
		const data: unknown = JSON.parse(
			await read({
				namespace: "multi",
				fileName: `${this.#options.name}/${parsedId}.json`,
			})
		);
		return this.#options.schema.item.parse(data) as z.infer<ItemSchema>;
	}

	public async put(item: z.infer<ItemSchema>) {
		const parsedId = idSchema.parse(item.id);
		const parsedItem = this.#options.schema.item.parse(item);
		await write({
			namespace: "multi",
			fileName: `${this.#options.name}/${parsedId}.json`,
			data: stringify(parsedItem),
		});
		const synopsis = this.#options.schema.synopsis.parse(this.#options.getSynopsis(parsedItem));
		await this.#updateList(parsedId, synopsis);
	}

	public async remove(id: string) {
		const parsedId = idSchema.parse(id);
		await this.#updateList(parsedId, undefined);
		await remove({
			namespace: "multi",
			fileName: `${this.#options.name}/${parsedId}.json`,
		});
	}

	async #updateList(id: string, synopsis: z.infer<SynopsisSchema> | undefined) {
		const list = await this.list();
		if (synopsis == undefined) {
			delete list[id];
		} else {
			list[id] = synopsis;
		}
		await write({
			namespace: "multi",
			fileName: `${this.#options.name}.json`,
			data: stringify({ version: this.#options.version, items: list }),
		});
	}
}

interface MultiJsonOptions<ItemSchema extends BaseItemSchema, SynopsisSchema extends BaseSynopsisSchema> {
	name: string;
	version: number;
	schema: {
		item: ItemSchema;
		synopsis: SynopsisSchema;
	};
	getSynopsis: GetSynopsisFn<ItemSchema, SynopsisSchema>;
}

export const idSchema = z
	.string()
	.regex(/^[a-z0-9_-]{1,45}$/i, "id must be 1-45 charcters and only contain 'a-z0-9_-'");
export const nameSchema = z
	.string()
	.regex(/^[/a-z0-9_-]{1,45}$/i, "name must be 1-45 charcters and only contain 'a-z0-9_-'");

type BaseItemSchema = z.ZodObject<{ id: z.ZodString }>;
type BaseSynopsisSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;
type GetSynopsisFn<ItemSchema extends BaseItemSchema, SynopsisSchema extends BaseSynopsisSchema> = (
	item: z.infer<ItemSchema>
) => z.infer<SynopsisSchema>;
