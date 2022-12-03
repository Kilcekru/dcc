import "./index.less";

import { createSignal } from "solid-js";
import { render } from "solid-js/web";

import styles from "./index.module.less";

const App = () => {
	const [count, setCount] = createSignal(1);
	const increment = () => setCount(count() + 1);

	return (
		<>
			<div>Hello solid-js</div>
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
