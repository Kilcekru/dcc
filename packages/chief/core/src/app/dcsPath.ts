import * as Path from "node:path";

import { app } from "electron";
import FS from "fs-extra";
import { promisified as regedit, RegistryItem, setExternalVBSLocation } from "regedit";

setExternalVBSLocation("./vbs");

const registryPath = "HKCU\\SOFTWARE\\Eagle Dynamics\\DCS World";
const registryPathBeta = "HKCU\\SOFTWARE\\Eagle Dynamics\\DCS World OpenBeta";

export interface DcsPaths {
	install: string;
	savedGames: string;
}

export async function findDcsPaths(): Promise<Partial<DcsPaths>> {
	const install = await findDcsInstallPath();
	if (install == undefined) {
		return {};
	}
	const savedGames = await findDcsSavedGamesPath(install);
	return { install, savedGames };
}

export async function findDcsInstallPath(): Promise<string | undefined> {
	const listResult = await regedit.list([registryPath, registryPathBeta]);
	let installPath = await checkRegistryItem(listResult[registryPathBeta]);
	if (installPath == undefined) {
		installPath = await checkRegistryItem(listResult[registryPath]);
	}
	return installPath;
}

export async function findDcsSavedGamesPath(installDir: string): Promise<string | undefined> {
	let variant: string | undefined = undefined;
	try {
		variant = await FS.readFile(Path.join(installDir, "dcs_variant.txt"), "utf-8");
	} catch {
		// ignore
	}
	const folderName = variant == undefined ? "DCS" : `DCS.${variant}`;
	const savedGamesPath = Path.join(app.getPath("home"), "Saved Games", folderName);
	try {
		await FS.access(Path.join(savedGamesPath, "Config", "options.lua"));
	} catch {
		return undefined;
	}
	return savedGamesPath;
}

async function checkRegistryItem(item: RegistryItem): Promise<string | undefined> {
	if (!item.exists) {
		return undefined;
	}
	const dcsPath = item.values.Path?.value;
	if (typeof dcsPath !== "string") {
		return undefined;
	}
	try {
		await FS.access(Path.join(dcsPath, "bin", "DCS.exe"));
	} catch {
		return undefined;
	}
	return dcsPath;
}
