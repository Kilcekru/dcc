import Crypto from "node:crypto";
import FS from "node:fs";
import Path from "node:path";
import { fileURLToPath } from "node:url";

import chokidar from "chokidar";
import { WebContents } from "electron";

declare const BUILD_ENV: "dev" | "pro";

async function hashFile(filePath: string) {
	try {
		return await new Promise((resolve, reject) => {
			const hash = Crypto.createHash("sha1");
			const input = FS.createReadStream(filePath);
			input.on("data", (data) => hash.update(data));
			input.on("end", () => resolve(hash.digest("base64")));
			input.on("error", reject);
		});
	} catch (err) {
		return undefined;
	}
}

function watch(path: string, onChange: () => void) {
	let ready = false;
	let timer: NodeJS.Timeout;
	const hashes = new Map();

	const watcher = chokidar.watch(path, { ignoreInitial: true });
	watcher.on("ready", () => {
		ready = true;
	});
	watcher.on("all", async (event, filePath) => {
		if (event !== "add" && event !== "change" && event !== "unlink") {
			return;
		}
		const isReady = ready;
		const hash = event === "unlink" ? undefined : await hashFile(filePath);
		if (!isReady) {
			hashes.set(filePath, hash);
			return;
		}
		if (hash !== hashes.get(filePath)) {
			hashes.set(filePath, hash);
			if (timer != undefined) {
				clearTimeout(timer);
			}
			timer = setTimeout(onChange, 200);
		}
	});

	return {
		path,
		stop: async () => {
			try {
				await watcher.close();
			} catch {
				// ignore
			}
		},
	};
}

export function enableLiveReload(webContents: WebContents) {
	if (BUILD_ENV === "dev") {
		let watcher: ReturnType<typeof watch> | undefined;

		webContents.on("did-navigate", async (e, url) => {
			if (url.startsWith("file:///")) {
				const path = Path.dirname(fileURLToPath(url));

				if (path != watcher?.path) {
					await watcher?.stop();
					watcher = watch(path, () => {
						console.log(`Reloading content '${Path.basename(path)}'`); // eslint-disable-line no-console
						webContents.reloadIgnoringCache();
					});
				}
			}
		});

		webContents.on("destroyed", async () => {
			await watcher?.stop();
		});
	}
}
