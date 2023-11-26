import "./index.less";
import "./worker";

import { render } from "solid-js/web";

import { App } from "./App";

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
	render(() => <App />, rootElement);
} else {
	console.error("Missing root element"); // eslint-disable-line no-console
}
