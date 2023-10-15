import "./index.less";

import { onMount } from "solid-js";
import { render } from "solid-js/web";

import { Buttons } from "./buttons";
import Styles from "./index.module.less";
import { Menu } from "./menu";
import { StoreProvider, useSetExpanded } from "./store";

const App = () => {
	const setExpanded = useSetExpanded();

	onMount(() => {
		document.addEventListener("click", () => {
			setExpanded(false);
		});
	});

	return (
		<div class={Styles.container}>
			<Menu />
			<div>Digital Crew Chief</div>
			<Buttons />
		</div>
	);
};

const rootElement = document.getElementById("root");
if (rootElement != undefined) {
	render(
		() => (
			<StoreProvider>
				<App />
			</StoreProvider>
		),
		rootElement,
	);
} else {
	console.error("Missing root element"); // eslint-disable-line no-console
}
