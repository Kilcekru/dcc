import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { createMemo, onCleanup, onMount, Show, useContext } from "solid-js";

import { Airdrome } from "./Airdrome";
import { DownedPilot } from "./DownedPilot";
import { FlightGroup } from "./FlightGroup";
import { GroundGroup } from "./GroundGroup";
import style from "./OverlaySidebar.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { Sam } from "./Sam";
import { Structure } from "./Structure";
import { useOverlayClose } from "./utils";

export function OverlaySidebar() {
	const [store] = useContext(OverlaySidebarContext);
	const isOpen = createMemo(() => store.state != "closed");

	const onClose = useOverlayClose();

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
			<Show when={store.state === "ground group" || store.state === "ewr"}>
				<GroundGroup />
			</Show>
			<Show when={store.state === "airdrome"}>
				<Airdrome />
			</Show>
			<Show when={store.state === "sam"}>
				<Sam />
			</Show>
			<Show when={store.state === "downed pilot"}>
				<DownedPilot />
			</Show>

			<Components.Button onPress={onClose} class={style["close-button"]} large>
				<Components.Icons.Close />
			</Components.Button>
		</div>
	);
}
