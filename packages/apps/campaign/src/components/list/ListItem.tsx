import * as pressable from "@zag-js/pressable";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, createUniqueId, JSX, Match, Switch } from "solid-js";

import { optionalClass } from "../../utils";

const Item = (props: { children: JSX.Element; class?: string } & JSX.HTMLAttributes<any>) => {
	const { children, ...htmlProps } = props;
	return (
		<li class={optionalClass("list-item", props.class)} {...htmlProps}>
			{children}
		</li>
	);
};

const PressableItem = (props: { children: JSX.Element; class?: string; onPress: () => void }) => {
	const [state, send] = useMachine(
		pressable.machine({
			id: createUniqueId(),
			onPress() {
				props.onPress();
			},
		})
	);

	const api = createMemo(() => pressable.connect(state, send, normalizeProps));

	return (
		<Item {...api().pressableProps} class={optionalClass("list-item--pressable", props.class)}>
			{props.children}
		</Item>
	);
};
export const ListItem = (props: { children: JSX.Element; class?: string; onPress?: () => void }) => {
	return (
		<Switch fallback={<div>Not Found</div>}>
			<Match when={props.onPress == null}>
				<Item class={props.class}>{props.children}</Item>
			</Match>
			<Match when={props.onPress != null}>
				<PressableItem class={props.class} onPress={() => props.onPress?.()}>
					{props.children}
				</PressableItem>
			</Match>
		</Switch>
	);
};
