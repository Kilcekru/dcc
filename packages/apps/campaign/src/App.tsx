import { Show, useContext } from "solid-js";

import { CreateCampaign, Home } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";

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
				<Home />
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
