import { cnb } from "cnbuilder";
import { JSX, Match, Switch } from "solid-js";

import style from "./ListItem.module.less";

const Item = (props: { children: JSX.Element; class?: string } & JSX.HTMLAttributes<HTMLLIElement>) => {
	return (
		<li {...props} class={cnb(props.class)}>
			{props.children}
		</li>
	);
};

const PressableItem = (props: { children: JSX.Element; class?: string; onPress: () => void }) => {
	return (
		<Item onClick={() => props.onPress()} class={cnb(style["list-item--pressable"], props.class)}>
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
