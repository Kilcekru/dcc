import * as Path from "node:path";
import { pathToFileURL } from "node:url";
import tailwindPlugin from "esbuild-plugin-tailwindcss";
import chokidar from "chokidar";
import esbuild from "esbuild";
import FS from "fs-extra";
import { log, paths } from "./utils.mjs";
import { watchBuild } from "./watcher.mjs";
import { TanStackRouterEsbuild } from "@tanstack/router-plugin/esbuild";
import { build } from "vite";
import react from "@vitejs/plugin-react";

export async function buildApps({ env, watch }) {
	const apps = await findApps();

	const promises = [];

	for (const app of apps) {
		/* if (app.name !== "campaign") continue;
		console.log(app, watch, Path.join(paths.target, "apps", app.name))
		await build({
			root: Path.join(paths.apps, app.name, "src"),
			plugins: [react()],
			build: {
				outDir: Path.join(paths.target, "apps", app.name),
				emptyOutDir: true,
			}
		}) */
		const options = {
			entryPoints: {
				index: Path.join(paths.apps, app.name, "src/index.tsx"),
			},
			outdir: Path.join(paths.target, "apps", app.name),
			bundle: true,
			minify: env === "pro",
			loader: {
				".svg": "dataurl",
				".png": "file",
				".jpg": "file",
			},
			assetNames: "[name]",
			plugins: [tailwindPlugin(), TanStackRouterEsbuild({ target: "react", autoCodeSplitting: false })],
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

		promises.push(copyAssets({ app }));
	}
	promises.push(buildIndex({ apps, watch }));
	await Promise.all(promises);
}

async function findApps() {
	const list = await FS.readdir(paths.apps, { withFileTypes: true });

	const apps = [];
	for (const entry of list) {
		if (entry.isDirectory()) {
			try {
				await FS.access(Path.join(paths.apps, entry.name, "src/index.tsx"));
				let appConfig;
				try {
					appConfig = (await import(pathToFileURL(Path.join(paths.apps, entry.name, "build.config.js")))).default;
				} catch (err) {
					// ignore
				}
				apps.push({
					name: entry.name,
					config: appConfig,
				});
			} catch {
				log("warn", `Invalid app '${entry.name}'`);
			}
		}
	}
	return apps;
}

async function buildIndex({ apps, watch }) {
	await copyIndex({ apps });
	if (watch) {
		chokidar.watch(paths.indexHtml, { ignoreInitial: true }).on("all", async () => {
			try {
				await copyIndex({ apps });
				log("info", "Rebuilt index.html");
			} catch (err) {
				log("err", `Rebuild index.html failed (${err.message})`);
			}
		});
	}
}

async function copyIndex({ apps }) {
	const index = await FS.readFile(paths.indexHtml, "utf-8");

	const promises = apps.map(async (app) => {
		const content = index.replaceAll("<!-- INJECT-TITLE -->", app.name.charAt(0).toUpperCase() + app.name.slice(1));
		await FS.outputFile(Path.join(paths.target, "apps", app.name, "index.html"), content);
	});

	await Promise.all(promises);
}

async function copyAssets({ app }) {
	console.log(`Copying assets for ${app.name}...`, app.config?.assets);
	const promises = [];
	for (const [target, source] of Object.entries(app.config?.assets ?? {})) {
		const src = Path.isAbsolute(source) ? source : Path.join(paths.apps, app.name, source);
		const dest = Path.join(paths.target, "apps", app.name, target);

		try {
			const stats = await FS.stat(src);
			const isDirectory = stats.isDirectory();
			console.log(`Copying ${isDirectory ? "directory" : "file"}: ${src} -> ${dest}`);
			promises.push(FS.copy(src, dest));
		} catch (error) {
			console.error(`Failed to copy asset from ${src} to ${dest}:`, error);
		}
	}
	await Promise.all(promises);
}
