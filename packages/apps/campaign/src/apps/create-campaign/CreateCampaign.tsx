import { ErrorBoundary, Match, Switch } from "solid-js";

import styles from "./CreateCampaign.module.less";
import { CreateCampaignProvider, useCreateCampaignStore } from "./CreateCampaignContext";
import { CustomFaction, Factions, ScenarioDescription, Scenarios, Settings } from "./screens";
import { BalanceSettings } from "./screens/BalanceSettings";

export const optionalClass = (className: string, optionalClass?: string) => {
	return className + (optionalClass == null ? "" : " " + optionalClass);
};

const CreateCampaign = () => {
	const store = useCreateCampaignStore();
	/* const createToast = useCreateErrorToast();

	const onActivate = async (campaignParams: Types.Campaign.CampaignParams) => {
		const blue = blueFaction();
		const red = redFaction();
		if (blue == null || red == null) {
			return;
		}

		try {
			const scenarioDefinition = scenarioList.find((s) => s.name === scenario());

			if (scenarioDefinition == null) {
				throw new Error("Scenario not found");
			}

			sendWorkerMessage({
				name: "generate",
				payload: {
					blueFactionDefinition: blue,
					redFactionDefinition: red,
					scenario: scenarioDefinition,
					campaignParams,
				},
			});

			sendWorkerMessage({
				name: "resume",
				payload: { multiplier: 1 },
			});
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			createToast({
				title: "Campaign not created",
				description: e instanceof Error ? e.message : "Unknown Error",
			});
		}
	}; */

	return (
		<ErrorBoundary fallback={<div>Something went wrong during campaign creation</div>}>
			<div class={styles["create-campaign"]}>
				<div class={styles["create-campaign__content"]}>
					<Switch fallback={<div>Not Found</div>}>
						<Match when={store.currentScreen === "Scenarios"}>
							<Scenarios />
						</Match>
						<Match when={store.currentScreen === "Description"}>
							<ScenarioDescription />
						</Match>
						<Match when={store.currentScreen === "Faction" || store.currentScreen === "Enemy Faction"}>
							<Factions />
						</Match>
						<Match when={store.currentScreen === "Custom Faction"}>
							<CustomFaction />
						</Match>
						<Match when={store.currentScreen === "Settings"}>
							<Settings />
						</Match>
						<Match when={store.currentScreen === "Balance Settings"}>
							<BalanceSettings />
						</Match>
					</Switch>
				</div>
			</div>
		</ErrorBoundary>
	);
};

function CreateCampaignWithContext() {
	return (
		<CreateCampaignProvider>
			<CreateCampaign />
		</CreateCampaignProvider>
	);
}

export { CreateCampaignWithContext as CreateCampaign };
