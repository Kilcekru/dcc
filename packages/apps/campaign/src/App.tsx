import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import type * as Types from "@kilcekru/dcc-shared-types";
import { createEffect, createSignal, Match, onCleanup, onMount, Show, Switch, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CreateCampaign, Home, Open } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";
import { DataProvider } from "./components/DataProvider";
import { ModalProvider, useSetIsPersistanceModalOpen } from "./components/modalProvider";
import { PersistenceModal } from "./components/persistance-modal";
import { Config } from "./data";
import { closeCampaign, loadCampaignIntoStore } from "./hooks";
import { onWorkerEvent } from "./worker";

const App = (props: { open: boolean }) => {
	const setIsPersistanceModalOpen = useSetIsPersistanceModalOpen();
	const [state, { deactivate, stateUpdate, timeUpdate }] = useContext(CampaignContext);
	const [open, setOpen] = createSignal(false);
	let serializedSubscription: { dispose: () => void } | undefined;
	let stateUpdateSubscription: { dispose: () => void } | undefined;
	let timeUpdateSubscription: { dispose: () => void } | undefined;

	createEffect(() => setOpen(props.open));

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
			<Show when={state.loaded} fallback={<div>Loading Campaigns...</div>}>
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
	const [campaignState, setCampaignState] = createSignal<Partial<DcsJs.CampaignState> | null | undefined>(undefined);
	const [open, setOpen] = createSignal(false);

	onMount(async () => {
		setCampaignState({
			loaded: true,
		});

		rpc.campaign
			.resumeCampaign(Config.campaignVersion)
			.then(async (loadedState) => {
				console.log("load", loadedState); // eslint-disable-line no-console

				if (loadedState == null) {
					setCampaignState({
						loaded: true,
					});

					if (loadedState === undefined) {
						setOpen(true);
					}

					return;
				}

				await loadCampaignIntoStore(loadedState);

				setCampaignState({
					active: true,
					loaded: true,
				});
			})
			.catch((e) => {
				console.error("RPC Load", e instanceof Error ? e.message : "unknown error"); // eslint-disable-line no-console
				setCampaignState({
					loaded: true,
				});
			});
	});

	return (
		<Show when={campaignState !== undefined} fallback={<div>Loading...</div>}>
			<CampaignProvider campaignState={campaignState()}>
				<App open={open()} />
			</CampaignProvider>
		</Show>
	);
};

const AppWithData = () => {
	return (
		<Components.ToastProvider>
			<DataProvider>
				<ModalProvider>
					<AppWithContext />
				</ModalProvider>
			</DataProvider>
		</Components.ToastProvider>
	);
};

export { AppWithData as App };
