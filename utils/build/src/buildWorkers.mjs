import * as Path from "node:path";
import { pathToFileURL } from "node:url";

import esbuild from "esbuild";
import FS from "fs-extra";

import { log, paths } from "./utils.mjs";
import { watchBuild } from "./watcher.mjs";

export async function buildWorkers({ env, watch }) {
	const workers = await findWorkers();

	const promises = [];

	for (const worker of workers) {
		const options = {
			entryPoints: {
				index: Path.join(paths.workers, worker.name, "src/index.ts"),
			},
			outfile:
				typeof worker.config?.buildTarget === "string"
					? Path.join(paths.target, worker.config.buildTarget)
					: Path.join(paths.target, "workers", worker.name),
			bundle: true,
			minify: env === "pro",
		};

		if (watch) {
			await watchBuild({
				options,
				onRebuildEnd: ({ error, time }) => {
					if (error != undefined) {
						log("warn", `Rebuilt apps with errors (${time} ms)`);
					} else {
						log("info", `Rebuilt apps (${time} ms)`);
					}
				},
			});
		} else {
			promises.push(esbuild.build(options));
		}
	}
	await Promise.all(promises);
}

async function findWorkers() {
	const list = await FS.readdir(paths.workers, { withFileTypes: true });

	const workers = [];
	for (const entry of list) {
		if (entry.isDirectory()) {
			try {
				await FS.access(Path.join(paths.workers, entry.name, "src/index.ts"));
				let workerConfig;
				try {
					workerConfig = (await import(pathToFileURL(Path.join(paths.workers, entry.name, "build.config.js")))).default;
				} catch (err) {
					// ignore
				}
				workers.push({
					name: entry.name,
					config: workerConfig,
				});
			} catch {
				log("warn", `Invalid worker '${entry.name}'`);
			}
		}
	}
	return workers;
}
