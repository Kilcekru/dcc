import * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { MissionState } from "@kilcekru/dcc-shared-rpc-types";
import { cnb } from "cnbuilder";
import { createEffect, createSignal, Show, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CampaignContext, Clock } from "../../../../components";
import { DataContext } from "../../../../components/DataProvider";
import { useSave } from "../../../../hooks";
import { calcTakeoffTime, getFlightGroups } from "../../../../utils";
import { ClientList } from "./ClientList";
import { Debrief } from "./Debrief";
import { HowToStartModal } from "./HowToStartModal";
import Styles from "./MissionOverlay.module.less";
import { PersistenceModal } from "./PersistenceModal";

export function MissionOverlay(props: { show: boolean; onClose: () => void }) {
	const [state, { submitMissionState, pause }] = useContext(CampaignContext);
	const [forwarding, setForwarding] = createSignal<boolean | undefined>(undefined);
	const [isHowToStartOpen, setIsHowToStartOpen] = createSignal(false);
	const [isPersistenceOpen, setIsPersistenceOpen] = createSignal(false);
	const [missionState, setMissionState] = createSignal<MissionState | undefined>(undefined);
	const [flightGroups, setFlightGroups] = createSignal<{
		blue: Array<DcsJs.CampaignFlightGroup>;
		red: Array<DcsJs.CampaignFlightGroup>;
	}>({ blue: [], red: [] });

	const onSave = useSave();

	const onGenerateMission = async () => {
		pause?.();
		onSave();
		setForwarding(false);

		const unwrapped = unwrap(state);

		if (unwrapped.blueFaction == null || unwrapped.redFaction == null) {
			throw "faction not found";
		}

		try {
			await rpc.campaign.generateCampaignMission(JSON.parse(JSON.stringify(unwrapped)) as DcsJs.Campaign);
		} catch (e) {
			const errorString = String(e).split("'rpc':")[1];

			if (errorString == null) {
				return;
			}

			// eslint-disable-next-line no-console
			console.error(errorString);
			createToast({
				title: "Mission Generation failed",
				description: errorString,
			});
		}
	};

	createEffect(() => {
		const takeoffTime = calcTakeoffTime(state.blueFaction?.packages);
		if (takeoffTime != null && props.show) {
			if (state.timer >= takeoffTime) {
				void onGenerateMission();
			} else {
				setForwarding(true);
			}
		}
	});

	const dataStore = useContext(DataContext);
	const createToast = Components.useCreateErrorToast();

	const onSubmit = async () => {
		try {
			const loadedMissionState = await rpc.campaign.loadMissionState();

			if (loadedMissionState == null) {
				// eslint-disable-next-line no-console
				console.error("mission result not found");
				return;
			}

			if (loadedMissionState.time < state.timer) {
				createToast({
					description: "Mission Result is in the past",
					title: "Mission not saved",
				});
				return;
			}

			setFlightGroups({
				blue: structuredClone(
					unwrap(getFlightGroups(state.blueFaction?.packages))
				) as unknown as Array<DcsJs.CampaignFlightGroup>,
				red: structuredClone(
					unwrap(getFlightGroups(state.redFaction?.packages))
				) as unknown as Array<DcsJs.CampaignFlightGroup>,
			});

			submitMissionState?.(loadedMissionState, dataStore);
			// onSave();

			setMissionState(loadedMissionState);
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);

			createToast({
				description: "Mission Result not found",
				title: "Mission not saved",
			});
			// eslint-disable-next-line no-console
			console.error("mission result not found");
			return;
		}
	};

	const onCancel = () => {
		props.onClose();
	};

	return (
		<div class={cnb(Styles["mission-overlay"], props.show && Styles["mission-overlay--show"])}>
			<div class={Styles.content}>
				<Show when={missionState() == null}>
					<h1 class={cnb(Styles.title, forwarding() === false ? Styles["title--show"] : null)}>Mission generated</h1>
					<div class={cnb(Styles.clock, forwarding() === true ? Styles["clock--forwarding"] : null)}>
						<Clock value={state.timer} />
					</div>
					<div class={cnb(Styles["help-text"], forwarding() === false ? Styles["help-text--show"] : null)}>
						<div>
							<h2>
								You can now start the Mission from within DCS.{" "}
								<Components.Button onPress={() => setIsHowToStartOpen(true)} unstyled>
									<Components.Icons.QuestionCircle />
								</Components.Button>
							</h2>
							<p>After the Mission you can submit the Result with the button below.</p>
							<div class={Styles["persistent-hint"]}>
								Make sure DCC is able to persist the mission state
								<Components.Tooltip text="Learn more">
									<Components.Button onPress={() => setIsPersistenceOpen(true)} unstyled>
										<Components.Icons.QuestionCircle />
									</Components.Button>
								</Components.Tooltip>
							</div>
						</div>
						<ClientList />
					</div>

					<div class={cnb(Styles["buttons"], forwarding() === false ? Styles["buttons--show"] : null)}>
						<Components.Button onPress={onCancel} class={Styles.button} large>
							Cancel
						</Components.Button>
						<Components.Button onPress={onSubmit} class={Styles.button} large>
							Submit Mission Result
						</Components.Button>
					</div>
				</Show>
				<Show when={missionState() != undefined}>
					<Debrief missionState={missionState()} flightGroups={flightGroups()} onClose={() => props.onClose()} />
				</Show>
			</div>

			<PersistenceModal isOpen={isPersistenceOpen()} onClose={() => setIsPersistenceOpen(false)} />
			<HowToStartModal isOpen={isHowToStartOpen()} onClose={() => setIsHowToStartOpen(false)} />
		</div>
	);
}
