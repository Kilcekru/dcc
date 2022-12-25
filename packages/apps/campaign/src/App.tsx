import { CampaignProvider, Clock, Map } from "./components";

export const App = () => {
	return (
		<CampaignProvider>
			<div>
				<Clock />
				<Map />
			</div>
		</CampaignProvider>
	);
};
