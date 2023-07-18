import FS from "fs-extra";

import { buildApps } from "./buildApps.mjs";
import { buildChief } from "./buildChief.mjs";
import { buildMenu } from "./buildMenu.mjs";
import { log, paths } from "./utils.mjs";

const watch = process.argv.includes("--watch");
const env = watch ? "dev" : "pro";

async function main() {
	const start = Date.now();

	await FS.remove(paths.target);
	await Promise.all([buildChief({ env, watch }), buildMenu({ env, watch }), buildApps({ env, watch })]);

	log("info", `Build done in ${Date.now() - start} ms`);
}

main();
