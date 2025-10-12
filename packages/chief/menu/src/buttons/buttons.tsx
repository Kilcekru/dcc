import { useSelector } from "@xstate/store/react";
import React from "react";

import { handleAction } from "../ipc";
import { menuStore } from "../store";
import Styles from "./buttons.module.less";
import { IconQuit } from "./icons";
import { IconMaximize } from "./icons/maximize";
import { IconMinimize } from "./icons/minimize";
import { IconUnMaximize } from "./icons/unmaximize";

export function Buttons() {
	const isMaximized = useSelector(menuStore, (state) => state.context.config?.isMaximized);

	return (
		<div className={Styles.container}>
			<IconMinimize onClick={() => handleAction("minimize")} />
			{isMaximized ? (
				<IconUnMaximize onClick={() => handleAction("unmaximize")} />
			) : (
				<IconMaximize onClick={() => handleAction("maximize")} />
			)}

			<IconQuit onClick={() => handleAction("quit")} />
		</div>
	);
}
