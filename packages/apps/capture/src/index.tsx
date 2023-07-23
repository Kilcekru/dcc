import "./index.less";

import { Document } from "@kilcekru/dcc-lib-document";
import * as Types from "@kilcekru/dcc-shared-types";
import { createSignal, JSXElement, onMount, Show } from "solid-js";
import { render } from "solid-js/web";

import * as IPC from "./ipc";

const App = () => {
	const [document, setDocument] = createSignal<Types.Capture.Document>();

	IPC.onRequestRender((doc) => {
		setDocument(undefined);
		setTimeout(() => setDocument(doc), 1);
	});

	onMount(() => {
		IPC.ready();
	});

	const onRendered = () => {
		setTimeout(() => IPC.renderComplete(), 1);
	};

	return (
		<Show when={document()} fallback={<div>Nothing to render</div>}>
			{(doc) => <Wrapper element={<Document document={doc()} />} onRendered={onRendered} />}
		</Show>
	);
};

const Wrapper = (props: { element: JSXElement; onRendered: () => void }) => {
	onMount(() => setTimeout(props.onRendered, 0));
	return <>{props.element}</>;
};

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
	render(() => <App />, rootElement);
} else {
	console.error("Missing root element"); // eslint-disable-line no-console
}
