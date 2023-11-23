import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { onEvent, rpc } from "@kilcekru/dcc-lib-rpc";
import { createEffect, createSignal, Match, onMount, Show, Switch, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CreateCampaign, Home, Open } from "./apps";
import { loadArray } from "./array";
import { load } from "./bec";
import { loadBit } from "./bit";
import { CampaignContext, CampaignProvider } from "./components";
import { DataProvider, useDataStore, useSetDataMap } from "./components/DataProvider";
import { ModalProvider, useSetIsPersistanceModalOpen } from "./components/modalProvider";
import { PersistenceModal } from "./components/persistance-modal";
import { Config } from "./data";
import { useSave } from "./hooks";
import { loadMini } from "./mini";
import { loadOld } from "./old";
import { migrateState } from "./utils";

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

	onEvent("menu.campaign.persistance", () => {
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

/* type Entity = {
	Coalition?: DcsJs.Coalition;
	Package?: {
		flightGroups: Array<number>;
	};
	FlightGroup?: {
		name: string;
	};
	Position?: {
		x: number;
		y: number;
	};
	Task?: {
		task: DcsJs.Task;
	};
	Aircraft?: {
		aircraftType: DcsJs.AircraftType;
	};
	Destroyed?: {
		time: number;
	};
	MaintenanceTime?: {
		time: number;
	};
}; */

const AppWithContext = () => {
	const [campaignState, setCampaignState] = createSignal<Partial<DcsJs.CampaignState> | null | undefined>(undefined);
	const setDataMap = useSetDataMap();
	const [open, setOpen] = createSignal(false);
	const dataStore = useDataStore();

	onMount(async () => {
		/* const world = bitECS.createWorld();
		const Task = bitECS.defineComponent();
		const Frequency = bitECS.defineComponent();
		const Package = bitECS.defineComponent<{ flightGroups: Array<number> }>();
		const FlightGroup = bitECS.defineComponent({
			name: bitECS.Types.ui8,
			number: bitECS.Types.ui8,
			index: bitECS.Types.ui8,
			task: bitECS.Types.ui8,
		});
		const Coalition = bitECS.defineComponent({ coalition: bitECS.Types.ui8 });
		const Position = bitECS.defineComponent({ x: bitECS.Types.f32, y: bitECS.Types.f32 }); */

		// const world = new miniplex.World<Entity>();

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

				const loops = 10;
				console.log("--becsy--"); // eslint-disable-line no-console
				void load(loadedState);
				console.log("--MiniPlex--"); // eslint-disable-line no-console
				loadMini(loadedState, loops);
				console.log("--Old School--"); // eslint-disable-line no-console
				loadOld(loadedState, loops);
				console.log("--bitECS--"); // eslint-disable-line no-console
				loadBit(loadedState, loops);
				console.log("--Array--"); // eslint-disable-line no-console
				loadArray(loadedState, loops);

				setCampaignState({
					...migrateState(loadedState, dataStore),
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
