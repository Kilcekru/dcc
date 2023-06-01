import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { Show } from "solid-js";

import Styles from "./_PathSelector.module.less";

interface PathSelectorProps {
	label: string;
	value: {
		value?: string;
		valid: boolean;
	};
	onChange: (path: string) => void;
	disabled?: boolean;
}

export const PathSelector = (props: PathSelectorProps) => {
	const showFileDialog = async () => {
		const path = await rpc.home.showOpenFileDialog({
			title: `Select ${props.label}`,
			defaultPath: props.value.value,
		});
		if (path != undefined) {
			props.onChange(path);
		}
	};

	return (
		<div class={Styles["path-selector"]}>
			<label class={Styles.label}>{props.label}</label>
			<div class={Styles.path}>
				<Components.TextField
					value={props.value.value ?? ""}
					onChange={(value) => props.onChange(value)}
					class={Styles.path__input}
					disabled={props.disabled}
				/>
				<Components.Button onPress={showFileDialog} disabled={props.disabled}>
					Search
				</Components.Button>
				<div>
					<Show
						when={props.value.valid}
						fallback={
							<div class={Styles["invalid-icon"]}>
								<Components.Icons.XCircleFill />
							</div>
						}
					>
						<div class={Styles["valid-icon"]}>
							<Components.Icons.CheckCircleFill />
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
};
