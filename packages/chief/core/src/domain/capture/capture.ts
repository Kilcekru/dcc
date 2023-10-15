import * as Types from "@kilcekru/dcc-shared-types";

import { config } from "../../config";
import { captureConfig } from "./config";
import { debugDocs } from "./debug";
import * as IPC from "./ipc";
import { getCaptureWindow } from "./window";

export async function capture(
	docs: Types.Capture.Document[],
	options?: { keepWindowOpen?: boolean },
): Promise<Buffer[]> {
	if (config.env === "dev") {
		debugDocs(docs);
	}

	const result: Buffer[] = [];
	const window = await getCaptureWindow();

	for (const doc of docs) {
		const painted = new Promise((r) => window?.webContents.once("paint", r));
		IPC.requestRender(window, doc);
		await painted;
		const image = await window.webContents.capturePage({
			width: captureConfig.width,
			height: captureConfig.height,
			x: 0,
			y: 0,
		});
		const png = image.resize({ height: captureConfig.height }).toPNG();
		result.push(png);
	}

	if (!options?.keepWindowOpen) {
		window.close();
	}

	return result;
}
