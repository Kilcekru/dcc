import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import { createEffect, createSignal, Match, onMount, Show, Switch, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CreateCampaign, Home, Open } from "./apps";
import { CampaignContext, CampaignProvider } from "./components";
import { DataProvider, useSetDataMap } from "./components/DataProvider";
import { ModalProvider, useSetIsPersistanceModalOpen } from "./components/modalProvider";
import { PersistenceModal } from "./components/persistance-modal";
import { Config } from "./data";
import { useSave } from "./hooks";

const App = (props: { open: boolean }) => {
	const setIsPersistanceModalOpen = useSetIsPersistanceModalOpen();
	const [state, { closeCampaign }] = useContext(CampaignContext);
	const save = useSave();
	const [open, setOpen] = createSignal(false);

	createEffect(() => setOpen(props.open));

	onEvent("menu.dev.logState", () => {
		console.log(unwrap(state)); // eslint-disable-line no-console
	});

	onEvent("menu.campaign.new", () => {
		setOpen(false);
		closeCampaign?.();
		save();
	});

	onEvent("menu.campaign.open", () => {
		setOpen(true);
		closeCampaign?.();
		save();
	});

	onEvent("menu.campaign.enablePersistance", () => {
		setIsPersistanceModalOpen(true);
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
	const setDataMap = useSetDataMap();
	const [open, setOpen] = createSignal(false);

	onMount(() => {
		rpc.campaign
			.resumeCampaign(Config.campaignVersion)
			.then((loadedState) => {
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

				if (loadedState.map != null) {
					setDataMap(loadedState.map);
				}
				setCampaignState({
					...loadedState,
					loaded: true,
				});

				setOpen(false);
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
