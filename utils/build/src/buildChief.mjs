import * as Path from "node:path";

import esbuild from "esbuild";

import { log, paths } from "./utils.mjs";

export async function buildChief({ env, watch }) {
	await esbuild.build({
		entryPoints: {
			index: Path.join(paths.chief, "core/src/index.js"),
			preload: Path.join(paths.chief, "preload/src/index.js"),
		},
		outdir: Path.join(paths.target, "chief"),
		bundle: true,
		minify: env === "pro",
		keepNames: true,
		platform: "node",
		target: "node16",
		define: {
			BUILD_ENV: JSON.stringify(env !== "pro"),
		},
		external: ["electron"],
		watch: watch && {
			onRebuild: (err) => {
				if (err) {
					log("err", `Rebuilt apps with error: ${err.message}`);
				} else {
					log("info", "Rebuilt chief");
				}
			},
		},
	});
}
