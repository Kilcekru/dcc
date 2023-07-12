import type * as DcsJs from "@foxdelta2/dcsjs";
import { createMemo, Show } from "solid-js";

import { useDataStore } from "../DataProvider";

export function AircraftLabel(props: { aircraftType: DcsJs.AircraftType }) {
	const dataStore = useDataStore();

	const aircraft = createMemo(() => {
		const dataAircrafts = dataStore.aircrafts;

		if (dataAircrafts == null) {
			return undefined;
		}

		return dataAircrafts[props.aircraftType];
	});

	return (
		<Show when={!(aircraft() == null)}>
			<div>
				{aircraft()?.display_name}
				{aircraft()?.controllable ? "" : "(AI)"}
				{aircraft()?.isMod ? "(Mod)" : ""}
			</div>
		</Show>
	);
}
