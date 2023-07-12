import * as radio from "@zag-js/radio-group";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createContext, createMemo, createUniqueId, JSX } from "solid-js";

import Styles from "./RadioGroup.module.less";

export const RadioContext = createContext<ReturnType<typeof radio.connect>>();

export function RadioGroup(props: { children?: JSX.Element; id?: string; onChange: (value: string) => void }) {
	const [state, send] = useMachine(
		radio.machine({
			id: createUniqueId(),
			// eslint-disable-next-line solid/reactivity
			value: props.id,
			onChange({ value }) {
				props.onChange(value);
			},
		}),
	);

	const api = createMemo(() => radio.connect(state, send, normalizeProps));

	return (
		<div {...api().rootProps} class={Styles.group}>
			<RadioContext.Provider value={api() /* eslint-disable-line solid/reactivity */}>
				{props.children}
			</RadioContext.Provider>
		</div>
	);
}
