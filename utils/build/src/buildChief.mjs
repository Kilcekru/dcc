import * as Path from "node:path";

import esbuild from "esbuild";

import { paths } from "./utils.mjs";

export async function buildChief() {
	await esbuild.build({
		entryPoints: {
			index: Path.join(paths.chief, "core/src/index.js"),
			preload: Path.join(paths.chief, "preload/src/index.js"),
		},
		outdir: Path.join(paths.target, "chief"),
		bundle: true,
		// minify: true,
		keepNames: true,
		platform: "node",
		target: "node16",
		external: ["electron"],
	});
}
