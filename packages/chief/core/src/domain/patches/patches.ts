import * as Path from "node:path";

import * as Types from "@kilcekru/dcc-shared-types";
import { app } from "electron";
import FS from "fs-extra";
import sudo from "sudo-prompt";

import { userConfig } from "../persistance/state";
import { patches } from "./config";

const tmpDir = Path.join(app.getPath("userData"), `.tmp/patch`);

export async function detectPatch(id: Types.Patch.Id) {
	if (!userConfig.data.dcs.available) {
		throw new Error("DCS paths not available in userconfig");
	}

	const patch = patches[id];
	const path = Path.join(userConfig.data.dcs.paths.install, patch.path);
	const content = await FS.readFile(path, "utf-8");
	const applied: Array<boolean | undefined> = [];
	for (const replacement of patch.replace ?? []) {
		if (createLineRegex(replacement.search).test(content)) {
			applied.push(false);
		} else if (createLineRegex(replacement.substitute).test(content)) {
			applied.push(true);
		} else {
			return undefined;
		}
	}
	if (applied.every((e) => e === false)) {
		return false;
	} else if (applied.every((e) => e === true)) {
		return true;
	}
	return undefined;
}

export async function executePatches(execs: Types.Patch.Execution[]) {
	if (!userConfig.data.dcs.available) {
		throw new Error("DCS paths not available in userconfig");
	}
	const filesToWrite: Array<{ path: string; content: string }> = [];

	for (const execution of execs) {
		const patch = patches[execution.id];
		const path = Path.join(userConfig.data.dcs.paths.install, patch.path);
		let content = await FS.readFile(path, "utf-8");
		let changed = false;

		for (const replacement of patch.replace ?? []) {
			const res =
				execution.action === "apply"
					? replaceLine(content, replacement.search, replacement.substitute)
					: replaceLine(content, replacement.substitute, replacement.search);
			content = res.content;
			changed = changed || res.changed;
		}

		if (changed) {
			filesToWrite.push({ path, content });
		}
	}
	if (filesToWrite.length > 0) {
		await writePatchFiles(filesToWrite);
	}
}

function replaceLine(content: string, search: string, substitute: string) {
	const regex = createLineRegex(search);
	if (regex.test(content)) {
		return { content: content.replace(regex, `$<ws>${substitute}`), changed: true };
	}
	return { content, changed: false };
}

function createLineRegex(search: string) {
	return new RegExp(`(?<=\\r?\\n)(?<ws>[\\t ]*)${escapeForRegex(search)}[\\t ]*(?=\\r?\\n)`, "g");
}

function escapeForRegex(value: string): string {
	return value.replace(/[. ()]/g, (value) => {
		switch (value) {
			case ".":
				return "\\.";
			case " ":
				return "[\\t ]*";
			case "(":
				return "\\(";
			case ")":
				return "\\)";
			default:
				throw new Error("escapeForRegex: invalid replacement");
		}
	});
}

async function writePatchFiles(files: Array<{ path: string; content: string }>) {
	const script = [];

	for (const file of files) {
		const fileName = Path.basename(file.path);
		const tmpPath = Path.join(tmpDir, fileName);
		await FS.outputFile(tmpPath, file.content);
		const sameDrive = Path.parse(tmpPath).root == Path.parse(file.path).root;

		try {
			if (sameDrive) {
				await FS.rename(tmpPath, file.path);
			} else {
				await FS.copyFile(tmpPath, file.path);
				await FS.unlink(tmpPath);
			}
		} catch (err) {
			if (err !== null && typeof err === "object" && "code" in err && err.code === "EPERM") {
				if (sameDrive) {
					script.push(`move /Y "${tmpPath}" "${file.path}"`);
				} else {
					script.push(`copy /Y "${tmpPath}" "${file.path}"`);
					script.push(`del "${tmpPath}"`);
				}
			} else {
				throw err;
			}
		}
	}

	if (script.length > 0) {
		const scriptPath = Path.join(tmpDir, "script.bat");
		await FS.outputFile(scriptPath, script.join("\r\n"));
		await new Promise<void>((resolve, reject) => {
			sudo.exec(scriptPath, { name: "DCC" }, (err) => {
				if (err != undefined) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
		await FS.unlink(scriptPath);
	}
}
