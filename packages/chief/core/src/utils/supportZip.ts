import AdmZip from "adm-zip";
import { app } from "electron";
import * as os from "os";
import * as Path from "path";

import * as Domain from "../domain";
import { getBasePath } from "../domain/persistance";

export async function createSupportZip(): Promise<string | undefined> {
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

	try {
		await archive.addLocalFolderPromise(getBasePath("multi"), {});
	} catch {
		// ignore
	}

	const missionPath = Domain.Campaign.getMissionPath();
	if (missionPath != undefined) {
		try {
			archive.addLocalFile(missionPath);
		} catch {
			// ignore
		}
	}

	const missionStatePath = Domain.Campaign.getMissionStatePath();
	if (missionStatePath != undefined) {
		try {
			archive.addLocalFile(missionStatePath);
		} catch {
			// ignore
		}
	}

	const filePath = Path.join(Domain.Persistance.State.userConfig.data.downloadsPath, "dcc_support.zip");
	await archive.writeZipPromise(filePath);
	return filePath;
}
