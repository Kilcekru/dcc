import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { Show, useContext } from "solid-js";

import { FlightGroup } from "./FlightGroup";
import style from "./OverlaySidebar.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { Structure } from "./Structure";

export function OverlaySidebar() {
	const [store, { close }] = useContext(OverlaySidebarContext);

	const onClose = () => {
		close?.();
	};

	return (
		<div class={cnb(style["overlay-sidebar"], store.state != "closed" ? style["overlay-sidebar--open"] : null)}>
			<Show when={store.state === "structure"}>
				<Structure />
			</Show>
			<Show when={store.state === "flight group"}>
				<FlightGroup />
			</Show>

			<Components.Button onPress={onClose} class={style["close-button"]} large>
				<Components.Icons.Close />
			</Components.Button>
		</div>
	);
}
