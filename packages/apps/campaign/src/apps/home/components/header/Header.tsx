import * as Components from "@kilcekru/dcc-lib-components";
import { rpc } from "@kilcekru/dcc-lib-rpc";
import { CampaignState } from "@kilcekru/dcc-shared-rpc-types";
import { createSignal, Show, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import { getClientFlightGroups } from "../../../../utils";
import { MissionOverlay } from "../mission-overlay";
import Styles from "./Header.module.less";
import { TimerClock } from "./TimerClock";

export const Header = () => {
	const [state, { setMultiplier, resume }] = useContext(CampaignContext);
	const [showOverlay, setShowOverlay] = createSignal(false);

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

	const onShowOverlay = async () => {
		setShowOverlay(true);
		setMultiplier?.(300);
		resume?.();
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
					<Components.Button onPress={onShowOverlay} large disabled={!hasClientFlightGroup()}>
						Takeoff
					</Components.Button>
				</Components.Tooltip>
			</div>
			<Show when={showOverlay()}>
				<MissionOverlay show={showOverlay()} onClose={() => setShowOverlay(false)} />
			</Show>
		</div>
	);
};
