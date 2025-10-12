import React from "react";

import Styles from "./icon.module.less";

export const IconUnMaximize = (props: { onClick: () => void }) => {
	return (
		<svg viewBox="0 0 30 30" className={Styles.windowsIcon} onClick={() => props.onClick()}>
			<path d="M10,12 L18,12 L18,20 L10,20 Z M12,12 L12,10 L20,10 L20,18 L18,18" />
		</svg>
	);
};
