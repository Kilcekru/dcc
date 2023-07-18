import { handleAction } from "../ipc";
import { useState } from "../store";
import Styles from "./buttons.module.less";
import { IconQuit } from "./icons";
import { IconMaximize } from "./icons/maximize";
import { IconMinimize } from "./icons/minimize";
import { IconUnMaximize } from "./icons/unmaximize";

export function Buttons() {
	const state = useState();

	return (
		<div class={Styles.container}>
			<IconMinimize onClick={() => handleAction("minimize")} />
			{state.config?.isMaximized ? (
				<IconUnMaximize onClick={() => handleAction("unmaximize")} />
			) : (
				<IconMaximize onClick={() => handleAction("maximize")} />
			)}

			<IconQuit onClick={() => handleAction("quit")} />
		</div>
	);
}
