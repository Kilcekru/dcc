import * as Types from "@kilcekru/dcc-shared-types";

import { config } from "./config";
import { requestRender, waitForRenderComplete } from "./ipc";
import { getCaptureWindow, isCaptureWindowVisible } from "./window";

export async function capture(docs: Types.Capture.Document[]): Promise<Buffer[]> {
	const result: Buffer[] = [];
	const window = await getCaptureWindow();

	for (const doc of docs) {
		const ready = waitForRenderComplete();
		requestRender(window, doc);
		await ready;
		const image = await window.webContents.capturePage({ width: config.width, height: config.height, x: 0, y: 0 });
		const png = image.resize({ height: config.height }).toPNG();
		result.push(png);
	}

	if (!isCaptureWindowVisible()) {
		window.close();
	}

	return result;
}
