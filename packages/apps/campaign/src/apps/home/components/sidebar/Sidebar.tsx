import "./Sidebar.less";

import { For, useContext } from "solid-js";

import { CampaignContext, Clock } from "../../../../components";
import { getFlightGroups } from "../../../../utils";

export const Sidebar = () => {
	const [state] = useContext(CampaignContext);

	return (
		<div class="sidebar">
			<div>Task</div>
			<div>Name</div>
			<div>Take Off</div>
			<div>TOT</div>
			<div>Duration</div>

			<For each={getFlightGroups(state.blueFaction?.packages ?? [])}>
				{(fg) => (
					<>
						<div>{fg.task}</div>
						<div>{fg.name}</div>
						<div>
							<Clock value={fg.startTime} />
						</div>
						<div>
							<Clock value={fg.tot} />
						</div>
						<div>
							<Clock value={fg.landingTime - fg.startTime} />
						</div>
					</>
				)}
			</For>
		</div>
	);
};
