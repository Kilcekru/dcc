import * as radio from "@zag-js/radio-group";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createContext, createMemo, createUniqueId, JSX } from "solid-js";

import Styles from "./RadioGroup.module.less";

export const RadioContext = createContext<ReturnType<typeof radio.connect>>();

export function RadioGroup(props: { children?: JSX.Element; id?: string; onChange: (value: string) => void }) {
	const service = useMachine(radio.machine, { id: createUniqueId() });

	const api = createMemo(() => radio.connect(service, normalizeProps));

	return (
		<div {...api().getRootProps()} class={Styles.group}>
			<RadioContext.Provider value={api() /* eslint-disable-line solid/reactivity */}>
				{props.children}
			</RadioContext.Provider>
		</div>
	);
}
