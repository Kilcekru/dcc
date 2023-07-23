import { createRequire } from "node:module";
import * as Path from "node:path";

import esbuild from "esbuild";
import FS from "fs-extra";

import { log, paths } from "./utils.mjs";
import { watchBuild } from "./watcher.mjs";

const require = createRequire(import.meta.url);

export async function buildChief({ env, watch }) {
	await copyRegeditVBS();

	const options = {
		entryPoints: {
			core: Path.join(paths.chief, "core/src/index.js"),
			"preload/main": Path.join(paths.chief, "preload/src/main.js"),
			"preload/menu": Path.join(paths.chief, "preload/src/menu.js"),
			"preload/capture": Path.join(paths.chief, "preload/src/capture.js"),
		},
		outdir: Path.join(paths.target, "chief"),
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
