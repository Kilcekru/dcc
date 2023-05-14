import type * as DcsJs from "@foxdelta2/dcsjs";
import { cnb } from "cnbuilder";
import { createMemo } from "solid-js";

import Styles from "./TaskLabel.module.less";

export const TaskLabel = (props: { task: DcsJs.Task; class?: string }) => {
	const taskClass = createMemo(() => {
		switch (props.task) {
			case "AWACS":
				return Styles["task--awacs"];
			case "CAS":
				return Styles["task--cas"];
			case "CAP":
				return Styles["task--cap"];
			case "Pinpoint Strike":
				return Styles["task--strike"];
			case "Escort":
				return Styles["task--escort"];
			default:
				return undefined;
		}
	});

	return <div class={cnb(Styles.task, taskClass(), props.class)}>{props.task}</div>;
};
