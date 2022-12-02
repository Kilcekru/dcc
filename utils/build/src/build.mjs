import FS from "fs-extra";

import { buildApps } from "./buildApps.mjs";
import { buildChief } from "./buildChief.mjs";
import { log, paths } from "./utils.mjs";

async function main() {
	const start = Date.now();

	await FS.remove(paths.target);
	await Promise.all([buildChief(), buildApps()]);

	log("info", `Build done in ${Date.now() - start} ms`);
}

main();
