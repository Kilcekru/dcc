import { cnb } from "cnbuilder";
import { createSignal, JSXElement, onCleanup, onMount } from "solid-js";

import styles from "./ScrollContainer.module.less";

export const ScrollContainer = (props: { children?: JSXElement; class?: string }) => {
	let ref: HTMLDivElement;
	let observer: ResizeObserver;
	const [isScrolledDown, setIsScrolledDown] = createSignal(false);
	const [isScrolledUp, setIsScrolledUp] = createSignal(false);

	const onScroll = () => {
		setIsScrolledDown(ref.scrollTop !== 0);
		setIsScrolledUp(ref.clientHeight + Math.ceil(ref.scrollTop) < ref.scrollHeight);
	};

	onMount(() => {
		observer = new ResizeObserver(() => onScroll());
		observer.observe(ref);
	});

	onCleanup(() => {
		ref.removeEventListener("keydown", onScroll);
		observer.disconnect();
	});

	return (
		<div class={cnb(styles["scroll-container__wrapper"], props.class)}>
			<div
				class={styles["scroll-container"]}
				ref={(el) => {
					el.addEventListener("scroll", onScroll);
					ref = el;
				}}
			>
				<div class={cnb(styles.shadow, styles["shadow--top"], isScrolledDown() ? styles["shadow--show"] : null)} />
				{props.children}
				<div class={cnb(styles.shadow, styles["shadow--bottom"], isScrolledUp() ? styles["shadow--show"] : null)} />
			</div>
		</div>
	);
};
