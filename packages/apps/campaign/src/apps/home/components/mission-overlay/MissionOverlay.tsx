import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import * as Types from "@kilcekru/dcc-shared-types";
import * as Utils from "@kilcekru/dcc-shared-utils";
import { cnb } from "cnbuilder";
import { createEffect, createMemo, createSignal, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { useModalContext, useSetIsPersistanceModalOpen } from "../../../../components/modalProvider";
import { useSave } from "../../../../hooks";
import { ClientList } from "./ClientList";
import { HowToStartModal } from "./HowToStartModal";
import Styles from "./MissionOverlay.module.less";

export function MissionOverlay(props: { show: boolean; onClose: () => void }) {
	const setIsPersistanceModalOpen = useSetIsPersistanceModalOpen();
	const modalContext = useModalContext();
	const [state] = useContext(CampaignContext);
	const [overlayState, setOverlayState] = createSignal<"forwarding" | "ready" | "generated">("forwarding");
	const [isHowToStartOpen, setIsHowToStartOpen] = createSignal(false);
	const [missionState, setMissionState] = createSignal<Types.Campaign.MissionState | undefined>(undefined);
	const isReady = createMemo(() => overlayState() === "ready");
	const isGenerated = createMemo(() => overlayState() === "generated");

	const save = useSave();

	const detectPersistance = async (): Promise<boolean> => {
		try {
			const patch = await rpc.patches.detectPatch("scriptFileAccess");
			return patch ?? true;
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(`detect patch: ${Utils.errMsg(e)}`);
			return true;
		}
	};

	const onGenerateMission = async () => {
		try {
			// generateMissionId?.(); TODO
			await rpc.campaign.generateCampaignMission(state);

			if (modalContext.isPersistanceIgnored || (await detectPersistance())) {
				setOverlayState("generated");
			} else {
				setIsPersistanceModalOpen(true);
			}
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
		// TODO
		/* const takeoffTime = calcTakeoffTime(state.blueFaction?.packages);
		if (takeoffTime != null && props.show) {
			if (state.timer >= takeoffTime) {
				setOverlayState("ready");
				pause?.();
				save();
			} else {
				setOverlayState("forwarding");
			}
		} */
	});

	const createToast = Components.useCreateErrorToast();

	const onSubmit = async () => {
		try {
			const loadedMissionState = await rpc.campaign.loadMissionState();

			if (loadedMissionState == null) {
				// eslint-disable-next-line no-console
				console.error("mission state not found");
				createToast({
					description: "Mission State not found",
					title: "Mission not saved",
				});
				return;
			}

			// TODO
			/* if (loadedMissionState.mission_id !== state.missionId) {
				createToast({
					description: "Incorrect Mission State",
					title: "Mission not saved",
				});
				return;
			} */

			// TODO
			// submitMissionState?.(loadedMissionState, dataStore);
			save();

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

	const onClose = () => {
		props.onClose();
		setMissionState(undefined);
	};

	return (
		<div class={cnb(Styles["mission-overlay"], props.show && Styles["mission-overlay--show"])}>
			<div class={Styles.content}>
				<Show when={missionState() == null}>
					<h1 class={cnb(Styles.title, isGenerated() ? Styles["title--show"] : null)}>Mission generated</h1>
					<h1 class={cnb(Styles.title, isReady() ? Styles["title--show"] : null)}>Ready for Takeoff</h1>
					<div class={cnb(Styles.clock, !isGenerated() ? Styles["clock--forwarding"] : null)}>
						<Components.Clock value={state.time} />
					</div>
					<div class={cnb(Styles["help-text"], isGenerated() ? Styles["help-text--show"] : null)}>
						<div>
							<h2>
								You can now start the Mission from within DCS.{" "}
								<Components.Button onPress={() => setIsHowToStartOpen(true)} unstyled>
									<Components.Icons.QuestionCircle />
								</Components.Button>
							</h2>
							<p>After the Mission you can submit the Result with the button below.</p>
						</div>
					</div>
					<div class={Styles["client-list-wrapper"]}>
						<ClientList />
					</div>

					<div class={cnb(Styles["buttons"], isGenerated() ? Styles["buttons--show"] : null)}>
						<Components.Button onPress={onClose} class={Styles.button} large>
							Cancel
						</Components.Button>
						<Components.Button onPress={onSubmit} class={Styles.button} large>
							Submit Mission State
						</Components.Button>
					</div>
					<div class={cnb(Styles["buttons"], isReady() ? Styles["buttons--show"] : null, Styles["buttons--generate"])}>
						{/* TODO
						<Components.Switch
							checked={state.hotStart ?? false}
							onChange={() => toggleHotStart?.()}
							class={Styles["hot-start"]}
						>
							Hot Start
	</Components.Switch> */}
						<div class={Styles.buttons__container}>
							<Components.Button onPress={onClose} class={Styles.button} large>
								Cancel
							</Components.Button>
							<Components.Button onPress={onGenerateMission} class={Styles.button} large>
								Generate Mission
							</Components.Button>
						</div>
					</div>
				</Show>
				{/* TODO 
				<Show when={missionState() != undefined}>
					<Debrief missionState={missionState()} flightGroups={[]} onClose={onClose} />
				</Show>
				*/}
			</div>

			<HowToStartModal isOpen={isHowToStartOpen()} onClose={() => setIsHowToStartOpen(false)} />
		</div>
	);
}
