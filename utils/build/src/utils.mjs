import * as Path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = Path.dirname(fileURLToPath(import.meta.url));
const repoPath = Path.join(dirname, "../../..");

export const paths = {
	apps: Path.join(repoPath, "packages/apps"),
	chief: Path.join(repoPath, "packages/chief"),
	workers: Path.join(repoPath, "packages/workers"),
	indexHtml: Path.join(dirname, "../assets/index.html"),
	target: Path.join(repoPath, "forge/dist"),
	vbs: Path.join(repoPath, "forge/vbs"),
};

export function log(lvl, msg) {
	const time = new Date().toISOString().slice(11, 23);
	const sev = lvl.toUpperCase().padStart(4);
	console.log(`${time} - ${sev}: ${msg}`); // eslint-disable-line no-console
}
