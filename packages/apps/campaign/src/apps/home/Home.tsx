import { useContext } from "solid-js";

import { CampaignContext, Clock, Map } from "../../components";

export const Home = () => {
	const [state] = useContext(CampaignContext);

	return (
		<>
			<h1>
				{state.blueFaction?.name} vs {state.redFaction?.name}
			</h1>
			<Clock />
			<Map />
		</>
	);
};
