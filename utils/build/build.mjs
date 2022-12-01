import * as Path from "node:path";

import esbuild from "esbuild";
import { fileURLToPath } from "url";

const dirname = Path.dirname(fileURLToPath(import.meta.url));
const repoPath = Path.join(dirname, "../..");

async function main() {
	await esbuild.build({
		entryPoints: {
			"dcc/index": Path.join(repoPath, "packages/crewChief/core/src/index.js"),
			"dcc/preload": Path.join(repoPath, "packages/crewChief/preload/src/index.js"),
		},
		outdir: Path.join(repoPath, "forge/dist"),
		bundle: true,
		// minify: true,
		keepNames: true,
		platform: "node",
		target: "node18",
		external: ["electron"],
	});
}

main();
