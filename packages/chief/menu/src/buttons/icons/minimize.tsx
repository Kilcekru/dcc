import Styles from "./icon.module.less";

export const IconMinimize = (props: { onClick: () => void }) => {
	return (
		<svg viewBox="0 0 30 30" class={Styles.windowsIcon} onClick={() => props.onClick()}>
			<path d="M10,15 L20,15" />
		</svg>
	);
};
