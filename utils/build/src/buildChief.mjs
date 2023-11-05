import { createRequire } from "node:module";
import * as Path from "node:path";

import { cssExtraPlugin } from "@kilcekru/esbuild-plugin-css-extra";
import chokidar from "chokidar";
import esbuild from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";
import FS from "fs-extra";

import { log, paths } from "./utils.mjs";
import { watchBuild } from "./watcher.mjs";

const require = createRequire(import.meta.url);

export async function buildChief(args) {
	await Promise.all([buildCore(args), buildPreload(args), buildMenu(args)]);
}

// core
export async function buildCore({ env, watch }) {
	await copyRegeditVBS();

	const options = {
		entryPoints: {
			index: Path.join(paths.chief, "core/src/index.js"),
		},
		outdir: Path.join(paths.target, "chief/core"),
		bundle: true,
		minify: env === "pro",
		keepNames: true,
		platform: "node",
		target: "node16",
		define: {
			BUILD_ENV: JSON.stringify(env),
		},
		loader: {
			// .template and .lua files are used by dcsjs
			// normally those are prebundled by dcsjs itself, but if dcsjs is linked via tsconfig for developing,
			// this build has to handle it.
			".template": "text",
			".lua": "text",
			// png and ogg are used by dcsjs and not prebundled
			".png": "file",
			".ogg": "file",
		},
		external: ["electron"],
	};

	if (watch) {
		await watchBuild({
			options,
			onRebuildEnd: ({ error, time }) => {
				if (error != undefined) {
					log("warn", `Rebuilt chief with errors (${time} ms)`);
				} else {
					log("info", `Rebuilt chief (${time} ms)`);
				}
			},
		});
	} else {
		await esbuild.build(options);
	}
}

async function copyRegeditVBS() {
	const path = Path.dirname(require.resolve("regedit"));
	await FS.copy(Path.join(path, "vbs"), paths.vbs);
}

// preload
export async function buildPreload({ env, watch }) {
	const options = {
		entryPoints: {
			main: Path.join(paths.chief, "preload/src/main.js"),
			menu: Path.join(paths.chief, "preload/src/menu.js"),
			capture: Path.join(paths.chief, "preload/src/capture.js"),
		},
		outdir: Path.join(paths.target, "chief/preload"),
		bundle: true,
		minify: env === "pro",
		keepNames: true,
		platform: "node",
		target: "node16",
		define: {
			BUILD_ENV: JSON.stringify(env),
		},
		external: ["electron"],
	};

	if (watch) {
		await watchBuild({
			options,
			onRebuildEnd: ({ error, time }) => {
				if (error != undefined) {
					log("warn", `Rebuilt preload with errors (${time} ms)`);
				} else {
					log("info", `Rebuilt preload (${time} ms)`);
				}
			},
		});
	} else {
		await esbuild.build(options);
	}
}

// menu
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
