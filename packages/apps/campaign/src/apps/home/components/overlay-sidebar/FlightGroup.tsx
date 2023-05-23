import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, createMemo, For, Show, useContext } from "solid-js";

import { FlightGroupButtons } from "../../../../components";
import { useFaction } from "../../../../components/utils";
import { Flag } from "./Flag";
import { FlightGroupUnit } from "./FlightGroupUnit";
import Styles from "./Item.module.less";
import { OverlaySidebarContext } from "./OverlaySidebarProvider";
import { useOverlayClose } from "./utils";

export function FlightGroup() {
	const [overlayStore] = useContext(OverlaySidebarContext);
	const onClose = useOverlayClose();

	const faction = useFaction(overlayStore.coalition);

	const flightGroup = createMemo(() => {
		const flightGroupId = overlayStore.flightGroupId;
		const pkg = faction()?.packages.find((pkg) => pkg.flightGroups.some((f) => f.id === flightGroupId));

		if (pkg == null) {
			return;
		}

		return pkg.flightGroups.find((f) => f.id === flightGroupId);
	});

	// Close if the flight group is removed
	createEffect(() => {
		if (flightGroup() == null) {
			onClose();
		}
	});

	return (
		<Show when={flightGroup() != null}>
			<div>
				<Flag countryName={faction()?.countryName} />
				<h2 class={Styles.title}>{flightGroup()?.name}</h2>
				<Components.TaskLabel task={flightGroup()?.task ?? "CAP"} class={Styles.task} />
				<FlightGroupButtons
					coalition={overlayStore.coalition}
					flightGroup={flightGroup()}
					class={Styles["flight-group-buttons"]}
				/>
			</div>
			<Components.ScrollContainer>
				<Components.List>
					<For each={flightGroup()?.units}>
						{(unit) => (
							<Components.ListItem>
								<FlightGroupUnit unit={unit} coalition={overlayStore.coalition ?? "blue"} />
							</Components.ListItem>
						)}
					</For>
				</Components.List>
			</Components.ScrollContainer>
		</Show>
	);
}
