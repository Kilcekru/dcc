import Styles from "./icon.module.less";

export const IconMaximize = (props: { onClick: () => void }) => {
	return (
		<svg viewBox="0 0 30 30" class={Styles.windowsIcon} onClick={() => props.onClick()}>
			<path d="M10,10 L20,10 L20,20 L10,20 Z" />
		</svg>
	);
};
