// import "./index.less";

import * as Types from "@kilcekru/dcc-shared-types";

import * as IPC from "./ipc";

const App = () => {
	IPC.onRequestRender((doc) => {
		// setDocument(doc);
	});

	return null;
};

IPC.onInitialize(() => {
	const rootElement = document.getElementById("root");
	if (rootElement != undefined) {
		null;
	} else {
		console.error("Missing root element"); // eslint-disable-line no-console
	}
});
