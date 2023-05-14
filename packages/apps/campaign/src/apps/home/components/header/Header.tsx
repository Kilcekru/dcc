import type * as DcsJs from "@foxdelta2/dcsjs";
import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, useContext } from "solid-js";
import { unwrap } from "solid-js/store";

import { CampaignContext } from "../../../../components";
import { getClientFlightGroups } from "../../../../utils";
import Styles from "./Header.module.less";
import { MissionOverlay } from "./MissionOverlay";
import { TimerClock } from "./TimerClock";

export const Header = () => {
	const [state, { pause }] = useContext(CampaignContext);
	const [showOverlay, setShowOverlay] = createSignal(false);
	const createToast = Components.useCreateErrorToast();

	const onSave = () => {
		rpc.campaign
			.save(JSON.parse(JSON.stringify(state)) as CampaignState)
			.then((result) => {
				console.log("save", result); // eslint-disable-line no-console
			})
			.catch((err) => {
				console.log("RPC error", err); // eslint-disable-line no-console
			});
	};

	const onGenerateMission = async () => {
		pause?.();
		onSave();

		const unwrapped = unwrap(state);

		if (unwrapped.blueFaction == null || unwrapped.redFaction == null) {
			throw "faction not found";
		}

		try {
			await rpc.campaign.generateCampaignMission(JSON.parse(JSON.stringify(unwrapped)) as DcsJs.Campaign);

			setShowOverlay(true);
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

	const hasClientFlightGroup = () => {
		const clientFlightGroups = getClientFlightGroups(state.blueFaction?.packages);

		return clientFlightGroups.length > 0;
	};

	return (
		<div class={Styles.header}>
			<h1 class={Styles.title}>Red Waters</h1>
			<div>
				<TimerClock />
			</div>
			<div class={Styles.buttons}>
				<Components.Button onPress={onSave} large>
					Save
				</Components.Button>
				<Components.Tooltip text="Join a Flight Group to Start" disabled={hasClientFlightGroup()}>
					<Components.Button onPress={onGenerateMission} large disabled={!hasClientFlightGroup()}>
						Takeoff
					</Components.Button>
				</Components.Tooltip>
			</div>
			<MissionOverlay show={showOverlay()} onClose={() => setShowOverlay(false)} />
		</div>
	);
};
