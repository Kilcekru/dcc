import * as Types from "@kilcekru/dcc-shared-types";
import { cnb } from "cnbuilder";
import { createSignal, For, Show } from "solid-js";

import * as IPC from "../ipc";
import { useSetExpanded, useState } from "../store";
import logo from "./logo.png";
import Styles from "./menu.module.less";

export const Menu = () => {
	const state = useState();
	const setExpanded = useSetExpanded();
	const [active, setActive] = createSignal<number>();

	return (
		<div class={Styles.container}>
			<img src={logo} class={Styles.logo} />
			<For each={state.config?.menu}>
				{(entry, i) => (
					<Show when={!entry.hidden}>
						<div
							class={cnb({
								[Styles.menu ?? ""]: true,
								[Styles.active ?? ""]: state.expanded && i() === active(),
								[Styles.disabled ?? ""]: entry.disabled,
								[Styles.highlight ?? ""]: entry.highlight,
							})}
							onClick={(e) => {
								if (entry.disabled) {
									return;
								}
								setActive(state.expanded ? undefined : i());
								setExpanded(!state.expanded);
								e.stopImmediatePropagation();
							}}
							onMouseEnter={() => {
								if (!entry.disabled && state.expanded) {
									setActive(i());
								}
							}}
						>
							{entry.label}
							<Show when={state.expanded && i() === active()}>
								<MenuDropdown items={entry.submenu} />
							</Show>
						</div>
					</Show>
				)}
			</For>
		</div>
	);
};

const MenuDropdown = (props: { items: Types.AppMenu.MenuEntry[] }) => {
	return (
		<div class={Styles.dropdown}>
			<For each={props.items}>
				{(entry) => {
					if (entry.type === "separator") {
						return <div class={Styles.separator} />;
					}
					if (entry.hidden) {
						return null;
					}
					return (
						<div
							class={cnb(Styles.menuEntry, {
								[Styles.disabled ?? ""]: entry.disabled,
								[Styles.highlight ?? ""]: entry.highlight,
							})}
							onClick={() => {
								if (entry.disabled) {
									return;
								}
								IPC.handleAction(entry.action);
							}}
						>
							{entry.label}
						</div>
					);
				}}
			</For>
		</div>
	);
};
