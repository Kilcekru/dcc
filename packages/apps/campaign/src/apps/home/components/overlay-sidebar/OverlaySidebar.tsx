import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, onCleanup, onMount, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { FlightGroup } from "./FlightGroup";
import { GroundGroup } from "./GroundGroup";
import style from "./OverlaySidebar.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { Structure } from "./Structure";

export function OverlaySidebar() {
	const [store, { close }] = useContext(OverlaySidebarContext);
	const [, { selectFlightGroup }] = useContext(CampaignContext);
	const isOpen = createMemo(() => store.state != "closed");

	const onClose = () => {
		if (store.state === "flight group") {
			selectFlightGroup?.(undefined);
		}
		close?.();
	};

	const onKeydown = (e: KeyboardEvent) => {
		if (e.key === "Escape" && isOpen()) {
			onClose();
		}
	};

	onMount(() => document.addEventListener("keydown", onKeydown));

	onCleanup(() => document.removeEventListener("keydown", onKeydown));

	return (
		<div class={cnb(style["overlay-sidebar"], isOpen() ? style["overlay-sidebar--open"] : null)}>
			<Show when={store.state === "structure"}>
				<Structure />
			</Show>
			<Show when={store.state === "flight group"}>
				<FlightGroup />
			</Show>
			<Show when={store.state === "ground group"}>
				<GroundGroup />
			</Show>

			<Components.Button onPress={onClose} class={style["close-button"]} large>
				<Components.Icons.Close />
			</Components.Button>
		</div>
	);
}
