import "./output.css";

import * as React from "react";
import { createRoot } from "react-dom/client";

import { App } from "./app";

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
	const root = createRoot(rootElement);
	root.render(<App />);
} else {
	console.error("Missing root element"); // eslint-disable-line no-console
}
