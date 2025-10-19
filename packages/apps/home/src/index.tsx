import "./output.css";
import "../../../libs/components/src/output.css";

import { StrictMode } from "react";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
