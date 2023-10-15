import { cnb } from "cnbuilder";

import Styles from "./icon.module.less";

export const IconQuit = (props: { onClick: () => void }) => {
	return (
		<svg viewBox="0 0 30 30" class={cnb(Styles.windowsIcon, Styles.quit)} onClick={() => props.onClick()}>
			<path d="M10,10 L20,20 M10,20 L20,10" />
		</svg>
	);
};
