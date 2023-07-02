import * as Path from "node:path";

import { DcsPaths } from "@kilcekru/dcc-shared-types";
import { app } from "electron";
import FS from "fs-extra";
import { promisified as regedit, RegistryItem, setExternalVBSLocation } from "regedit";

/**
 * resourcesPath is not available for `electron-forge start` (it points to node_modules)
 * so we use resourcesPath, if current directory is inside resourcesPath.
 * otherwise we resolve a relative path (for dev)
 */
const relative = Path.relative(process.resourcesPath, __dirname);
const isInResources = !relative.startsWith("..") && !Path.isAbsolute(relative);
const vbsDir = isInResources ? Path.join(process.resourcesPath, "vbs") : Path.join(__dirname, "../../vbs");

setExternalVBSLocation(vbsDir);

const registryPath = "HKCU\\SOFTWARE\\Eagle Dynamics\\DCS World";
const registryPathBeta = "HKCU\\SOFTWARE\\Eagle Dynamics\\DCS World OpenBeta";

export async function findDcsPaths(): Promise<Partial<DcsPaths>> {
	const install = await findDcsInstallPath();
	if (install == undefined) {
		return {};
	}
	const savedGames = await findDcsSavedGamesPath(install);
	return { install, savedGames };
}

async function findDcsInstallPath(): Promise<string | undefined> {
	const listResult = await regedit.list([registryPath, registryPathBeta]);
	let installPath = await checkRegistryItem(listResult[registryPathBeta]);
	if (installPath == undefined) {
		installPath = await checkRegistryItem(listResult[registryPath]);
	}
	return installPath;
}

export async function findDcsSavedGamesPath(installPath: string): Promise<string | undefined> {
	let variant: string | undefined = undefined;
	try {
		variant = await FS.readFile(Path.join(installPath, "dcs_variant.txt"), "utf-8");
	} catch {
		// ignore
	}
	const folderName = variant == undefined ? "DCS" : `DCS.${variant}`;
	const path = Path.join(app.getPath("home"), "Saved Games", folderName);
	if (await validateDcsSavedGamesPath(path)) {
		return path;
	} else {
		return undefined;
	}
}

async function checkRegistryItem(item: RegistryItem): Promise<string | undefined> {
	if (!item.exists) {
		return undefined;
	}
	const path = item.values.Path?.value;
	if (typeof path !== "string") {
		return undefined;
	}
	if (await validateDcsInstallPath(path)) {
		return path;
	} else {
		return undefined;
	}
}

export async function validateDcsInstallPath(path: string): Promise<boolean> {
	try {
		await FS.access(Path.join(path, "bin", "DCS.exe"));
		return true;
	} catch {
		return false;
	}
}

export async function validateDcsSavedGamesPath(path: string): Promise<boolean> {
	try {
		await FS.access(Path.join(path, "Config", "options.lua"));
		return true;
	} catch {
		return false;
	}
}
