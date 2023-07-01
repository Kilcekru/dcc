import AdmZip from "adm-zip";
import { app } from "electron";
import * as os from "os";
import * as Path from "path";

import { Campaign } from "../domain";
import { userConfig } from "../persistance";

export async function createSupportZip(): Promise<string | undefined> {
	if (userConfig.data.downloadsPath == undefined) {
		return undefined;
	}

	const archive = new AdmZip();

	archive.addFile(
		"info.json",
		Buffer.from(
			JSON.stringify({
				os: `${os.platform() === "win32" ? "Windows" : "Unsuppoerted"} ${os.release()}`,
				app: app.getVersion(),
				electron: process.versions.electron,
				node: process.versions.node,
				chrome: process.versions.chrome,
			}),
			"utf-8"
		)
	);

	// TODO
	/* await campaignState.load();
	if (campaignState.data != undefined) {
		archive.addFile("campaign.json", Buffer.from(JSON.stringify(campaignState.data), "utf-8"));
	} */

	const missionPath = Campaign.getMissionPath();
	if (missionPath != undefined) {
		try {
			archive.addLocalFile(missionPath);
		} catch {
			// ignore
		}
	}

	const missionStatePath = Campaign.getMissionStatePath();
	if (missionStatePath != undefined) {
		try {
			archive.addLocalFile(missionStatePath);
		} catch {
			// ignore
		}
	}

	const filePath = Path.join(userConfig.data.downloadsPath, "dcc_support.zip");
	await archive.writeZipPromise(filePath);
	return filePath;
}
