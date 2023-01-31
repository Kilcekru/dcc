import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Show } from "solid-js";

import styles from "./pathSelector.module.less";

interface PathSelectorProps {
	description: string;
	value: {
		value?: string;
		valid: boolean;
	};
	onChange: (path: string) => void;
}

export const PathSelector = (props: PathSelectorProps) => {
	const showFileDialog = async () => {
		const path = await rpc.launcher.showOpenFileDialog({
			title: `Select ${props.description}`,
			defaultPath: props.value.value,
		});
		if (path != undefined) {
			props.onChange(path);
		}
	};

	return (
		<div class={styles.pathSelector}>
			<div>
				{props.description} <button onClick={showFileDialog}>Search</button>
			</div>
			<input
				value={props.value.value}
				onChange={(v) => {
					props.onChange(v.currentTarget.value);
				}}
			/>
			<div>
				<Show when={props.value.valid} fallback={"Invalid directory"}>
					Valid directory
				</Show>
			</div>
		</div>
	);
};
