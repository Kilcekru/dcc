import { spawn } from "node:child_process";
import Crypto from "node:crypto";
import FS from "node:fs";

import chokidar from "chokidar";

const child = spawn("node_modules\\.bin\\electron-forge.CMD", ["start"], {
	stdio: ["pipe", "inherit", "inherit"],
});

child.on("error", (err) => {
	console.error("Error running electron-forge");
	console.error(err.message);
	process.exit(1);
});

child.on("exit", (code) => {
	process.exit(code ?? 0);
});

process.stdin.on("data", (data) => {
	child.stdin.write(data);
});

async function hashFile(filePath) {
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

function watchChief() {
	let ready = false;
	let timer;
	const hashes = new Map();

	const watcher = chokidar.watch("dist/chief");
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
			timer = setTimeout(() => {
				child.stdin.write("rs\n");
			}, 200);
		}
	});
}

setTimeout(watchChief, 5000);
