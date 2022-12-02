import * as Path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = Path.dirname(fileURLToPath(import.meta.url));
const repoPath = Path.join(dirname, "../../..");

export const paths = {
	build: Path.join(dirname, ".."),
	apps: Path.join(repoPath, "packages/apps"),
	chief: Path.join(repoPath, "packages/chief"),
	target: Path.join(repoPath, "forge/dist"),
};

export function log(lvl, msg) {
	const time = new Date().toISOString().slice(11, 23);
	const sev = lvl.toUpperCase().padStart(4);
	console.log(`${time} - ${sev}: ${msg}`); // eslint-disable-line no-console
}
