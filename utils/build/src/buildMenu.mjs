import * as Path from "node:path";

import { cssExtraPlugin } from "@kilcekru/esbuild-plugin-css-extra";
import chokidar from "chokidar";
import esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import FS from "fs-extra";

import { log, paths } from "./utils.mjs";
import { watchBuild } from "./watcher.mjs";

export async function buildMenu({ env, watch }) {
	await buildIndex({ watch });

	const options = {
		entryPoints: {
			index: Path.join(paths.chief, "menu/src/index.tsx"),
		},
		outdir: Path.join(paths.target, "chief/menu"),
		bundle: true,
		minify: env === "pro",
		loader: {
			".svg": "dataurl",
			".png": "file",
			".jpg": "file",
		},
		assetNames: "[name]",
		plugins: [solidPlugin(), cssExtraPlugin()],
	};

	if (watch) {
		await watchBuild({
			options,
			onRebuildEnd: ({ error, time }) => {
				if (error != undefined) {
					log("warn", `Rebuilt menu with errors (${time} ms)`);
				} else {
					log("info", `Rebuilt menu (${time} ms)`);
				}
			},
		});
	} else {
		await esbuild.build(options);
	}
}

async function buildIndex({ watch }) {
	await copyIndex();
	if (watch) {
		chokidar.watch(paths.indexHtml, { ignoreInitial: true }).on("all", async () => {
			try {
				await copyIndex();
				log("info", "Rebuilt index.html");
			} catch (err) {
				log("err", `Rebuild index.html failed (${err.message})`);
			}
		});
	}
}

async function copyIndex() {
	const index = await FS.readFile(paths.indexHtml, "utf-8");
	const content = index.replaceAll("<!-- INJECT-TITLE -->", "Menu");
	await FS.outputFile(Path.join(paths.target, "chief/menu/index.html"), content);
}
