import * as Path from "node:path";

export function getAppPath(name: string) {
	return Path.join(__dirname, "../apps", name, "index.html");
}
