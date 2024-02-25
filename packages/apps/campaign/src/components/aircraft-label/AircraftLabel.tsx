import * as DcsJs from "@foxdelta2/dcsjs";
import { createMemo, Show } from "solid-js";

export function AircraftLabel(props: { aircraftType: DcsJs.AircraftType }) {
	const aircraft = createMemo(() => {
		return DcsJs.aircraftDefinitions[props.aircraftType];
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
