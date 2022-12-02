import * as Path from "node:path";

import esbuild from "esbuild";
import postCss from "esbuild-plugin-postcss2";
import { solidPlugin } from "esbuild-plugin-solid";
import FS from "fs-extra";

import { log, paths } from "./utils.mjs";

export async function buildApps() {
	const apps = await findApps();

	const entryPoints = Object.fromEntries(
		apps.map((app) => [`${app}/index`, Path.join(paths.apps, app, "src/index.tsx")])
	);

	await Promise.all([
		esbuild.build({
			entryPoints,
			outdir: Path.join(paths.target, "apps"),
			bundle: true,
			// minify: true,
			loader: {
				".svg": "dataurl",
			},
			plugins: [solidPlugin(), postCss.default()],
		}),
		copyIndex(apps),
	]);
}

async function findApps() {
	const list = await FS.readdir(paths.apps, { withFileTypes: true });

	const apps = [];
	for (const entry of list) {
		if (entry.isDirectory()) {
			try {
				await FS.access(Path.join(paths.apps, entry.name, "src/index.tsx"));
				apps.push(entry.name);
			} catch {
				log("warn", `Invalid app '${entry.name}'`);
			}
		}
	}
	return apps;
}

async function copyIndex(apps) {
	const index = await FS.readFile(Path.join(paths.build, "assets/index.html"), "utf-8");

	const promises = apps.map(async (app) => {
		const content = index.replaceAll("<!-- INJECT-TITLE -->", app.charAt(0).toUpperCase() + app.slice(1));
		await FS.outputFile(Path.join(paths.target, "apps", app, "index.html"), content);
	});

	await Promise.all(promises);
}
