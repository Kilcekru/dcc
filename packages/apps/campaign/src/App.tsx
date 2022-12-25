import { Show, useContext } from "solid-js";

import { CreateCampaign } from "./apps";
import { CampaignContext, CampaignProvider, Clock, Map } from "./components";

const App = () => {
	const [state] = useContext(CampaignContext);
	return (
		<div>
			<Show
				when={state.active === true}
				fallback={
					<div>
						<CreateCampaign />
					</div>
				}
			>
				<>
					<Clock />
					<Map />
				</>
			</Show>
		</div>
	);
};

const AppWithContext = () => {
	return (
		<CampaignProvider>
			<App />
		</CampaignProvider>
	);
};

export { AppWithContext as App };
