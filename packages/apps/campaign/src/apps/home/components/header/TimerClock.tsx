import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, useContext } from "solid-js";

import { CampaignContext } from "../../../../components/CampaignProvider";
import { Clock } from "../../../../components/Clock";
import { useSave } from "../../../../hooks";
import { getClientFlightGroups } from "../../../../utils";
import Styles from "./TimerClock.module.less";

export const TimerClock = () => {
	const [state, { setMultiplier, resume, pause }] = useContext(CampaignContext);
	const save = useSave();

	const onPressMultiplier = (multiplier: number) => {
		if (state.winner == null) {
			setMultiplier?.(multiplier);
			resume?.();
		}
	};

	const hasClientFlightGroup = () => {
		const clientFlightGroups = getClientFlightGroups(state.blueFaction?.packages);

		return clientFlightGroups.length > 0;
	};

	createEffect(() => {
		if (state.winner == null) {
			return;
		}

		pause?.();
	});

	const onPause = () => {
		pause?.();
		save();
	};

	return (
		<div class={Styles.wrapper}>
			<div class={Styles.clock}>
				<Clock value={state.timer} withDay />
			</div>

			<div class={Styles.buttons}>
				<Components.Button onPress={onPause} unstyled class={Styles.icon}>
					{state.paused ? <Components.Icons.PauseFill /> : <Components.Icons.Pause />}
				</Components.Button>
				<Components.Button
					onPress={() => onPressMultiplier?.(1)}
					unstyled
					class={Styles.icon}
					disabled={hasClientFlightGroup()}
				>
					{!state.paused && state.multiplier === 1 ? <Components.Icons.PlayFill /> : <Components.Icons.Play />}
				</Components.Button>
				<Components.Button
					onPress={() => onPressMultiplier?.(300)}
					unstyled
					class={Styles.icon}
					disabled={hasClientFlightGroup()}
				>
					{!state.paused && state.multiplier > 1 ? (
						<Components.Icons.FastForwardFill />
					) : (
						<Components.Icons.FastForward />
					)}
				</Components.Button>
			</div>
		</div>
	);
};
