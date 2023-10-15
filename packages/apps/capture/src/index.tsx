import "./index.less";

import { Document } from "@kilcekru/dcc-lib-document";
import * as Types from "@kilcekru/dcc-shared-types";
import { createSignal, Show } from "solid-js";
import { render } from "solid-js/web";

import * as IPC from "./ipc";

const App = () => {
	const [document, setDocument] = createSignal<Types.Capture.Document>();

	IPC.onRequestRender((doc) => {
		setDocument(doc);
	});

	return (
		<Show when={document()} fallback={<div>Nothing to render</div>}>
			{(doc) => <Document document={doc()} />}
		</Show>
	);
};

IPC.onInitialize(() => {
	const rootElement = document.getElementById("root");
	if (rootElement != undefined) {
		render(() => <App />, rootElement);
	} else {
		console.error("Missing root element"); // eslint-disable-line no-console
	}
});
