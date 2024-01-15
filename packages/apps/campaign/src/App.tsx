import * as Components from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import type * as Types from "@kilcekru/dcc-shared-types";
import { createSignal, Match, onCleanup, onMount, Show, Switch, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CreateCampaign, Home, Open } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";
import { ModalProvider, useSetIsPersistanceModalOpen } from "./components/modalProvider";
import { PersistenceModal } from "./components/persistance-modal";
import { Config } from "./data";
import { closeCampaign, loadCampaignIntoStore } from "./hooks";
import { onWorkerEvent } from "./worker";

const App = () => {
	const setIsPersistanceModalOpen = useSetIsPersistanceModalOpen();
	const [state, { deactivate, stateUpdate, timeUpdate }] = useContext(CampaignContext);
	const [open, setOpen] = createSignal(false);
	let serializedSubscription: { dispose: () => void } | undefined;
	let stateUpdateSubscription: { dispose: () => void } | undefined;
	let timeUpdateSubscription: { dispose: () => void } | undefined;
	const [resumeState, setResumeState] = createSignal<"loading" | "loaded" | "error" | "empty">("loading");

	onMount(async () => {
		rpc.campaign
			.resumeCampaign(Config.campaignVersion)
			.then(async (loadedState) => {
				console.log("load", loadedState); // eslint-disable-line no-console

				if (loadedState == null) {
					setResumeState("empty");
					return;
				}

				await loadCampaignIntoStore(loadedState);
			})
			.catch((e) => {
				console.error("RPC Load", e instanceof Error ? e.message : "unknown error"); // eslint-disable-line no-console
				setResumeState("error");
			});
	});

	onEvent("menu.dev.logState", () => {
		console.log(unwrap(state)); // eslint-disable-line no-console
	});

	onEvent("menu.campaign.new", () => {
		setOpen(false);
		closeCampaign();
	});

	onEvent("menu.campaign.open", () => {
		setOpen(true);
		closeCampaign();
	});

	onEvent("menu.campaign.persistance", () => {
		setIsPersistanceModalOpen(true);
	});

	async function saveCampaign(state: Types.Campaign.WorkerState) {
		await rpc.campaign
			.saveCampaign(state)
			// eslint-disable-next-line no-console
			.catch((e) => console.error(e instanceof Error ? e.message : "unknown error"));
	}

	onMount(function onMount() {
		serializedSubscription = onWorkerEvent("serialized", async (event: Types.Campaign.WorkerEventSerialized) => {
			if (event.state.active === false) {
				deactivate?.();
			}
			void saveCampaign(event.state);
		});
		stateUpdateSubscription = onWorkerEvent("stateUpdate", async (event: Types.Campaign.WorkerEventStateUpdate) => {
			stateUpdate?.(event.state);
			setResumeState("loaded");
		});
		timeUpdateSubscription = onWorkerEvent("timeUpdate", (event: Types.Campaign.WorkerEventTimeUpdate) => {
			timeUpdate?.(event.time);
		});
	});

	onCleanup(() => {
		serializedSubscription?.dispose();
		stateUpdateSubscription?.dispose();
		timeUpdateSubscription?.dispose();
	});

	function onOpenCreateCampaign() {
		setOpen(false);
	}

	return (
		<>
			<Show when={resumeState() !== "loading"} fallback={<div>Loading Campaigns...</div>}>
				<Switch fallback={<div>Not Found</div>}>
					<Match when={state.active === true}>
						<Home />
					</Match>
					<Match when={state.active === false}>
						<Switch fallback={<div>Not Found</div>}>
							<Match when={open()}>
								<Open onOpenCreateCampaign={onOpenCreateCampaign} />
							</Match>
							<Match when={!open()}>
								<CreateCampaign />
							</Match>
						</Switch>
					</Match>
				</Switch>
			</Show>
			<PersistenceModal />
		</>
	);
};

const AppWithContext = () => {
	return (
		<CampaignProvider>
			<App />
		</CampaignProvider>
	);
};

const AppWithData = () => {
	return (
		<Components.ToastProvider>
			<ModalProvider>
				<AppWithContext />
			</ModalProvider>
		</Components.ToastProvider>
	);
};

export { AppWithData as App };
