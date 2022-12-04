import "./index.less";

import { rpc } from "@kilcekru/dcc-lib-rpc";
import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import styles from "./index.module.less";

const App = () => {
	const [count, setCount] = createSignal(1);
	const [versions, setVersions] = createSignal<Awaited<ReturnType<typeof rpc["misc"]["getVersions"]>>>();
	const increment = () => setCount(count() + 1);

	rpc.misc
		.getVersions()
		.then((v) => {
			void setVersions(() => v);
		})
		.catch((err) => {
			console.log("RPC error", err); // eslint-disable-line no-console
		});

	return (
		<>
			<div>Hello solid-js</div>
			<div>
				Versions: Electron {versions()?.electron} / Chrome {versions()?.chrome} / Node {versions()?.node}
			</div>
			<div>
				<button type="button" class={styles.button} onClick={increment}>
					{count()}
				</button>
			</div>
		</>
	);
};

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
	render(() => <App />, rootElement);
} else {
	console.error("Missing root element"); // eslint-disable-line no-console
}
