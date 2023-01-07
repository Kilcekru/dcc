import "./FlightGroupItem.less";

import type * as DcsJs from "@foxdelta2/dcsjs";
import { createSignal, Show } from "solid-js";

import { Checkbox, Clock, ListItem } from "../../../../components";

export const FlightGroupItem = (props: { flightGroup: DcsJs.CampaignFlightGroup }) => {
	const [expanded, setExpanded] = createSignal(false);
	return (
		<ListItem onPress={() => setExpanded((e) => !e)} class="flight-group-item">
			<div class="flight-group-item__flight-group">
				<div>{props.flightGroup.task}</div>
				<div>{props.flightGroup.name}</div>
				<div>
					<Clock value={props.flightGroup.startTime} />
				</div>
				<div>
					<Clock value={props.flightGroup.tot} />
				</div>
				<div>
					<Clock value={props.flightGroup.landingTime - props.flightGroup.startTime} />
				</div>
			</div>
			<Show when={expanded()}>
				<div>
					<Checkbox>Client</Checkbox>
				</div>
			</Show>
		</ListItem>
	);
};
