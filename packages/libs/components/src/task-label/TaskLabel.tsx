import type * as DcsJs from "@foxdelta2/dcsjs";
import { cnb } from "cnbuilder";
import { createMemo } from "solid-js";

import styles from "./TaskLabel.module.less";

export const TaskLabel = (props: { task: DcsJs.Task; class?: string }) => {
	const taskClass = createMemo(() => {
		switch (props.task) {
			case "AWACS":
				return styles["task--awacs"];
			case "CAS":
				return styles["task--cas"];
			case "CAP":
				return styles["task--cap"];
			case "Pinpoint Strike":
				return styles["task--strike"];
			case "Escort":
				return styles["task--escort"];
			default:
				return undefined;
		}
	});

	return <div class={cnb(styles.task, taskClass(), props.class)}>{props.task}</div>;
};
