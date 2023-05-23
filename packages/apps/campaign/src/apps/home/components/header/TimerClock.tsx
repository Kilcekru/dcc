import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, useContext } from "solid-js";

import { CampaignContext } from "../../../../components/CampaignProvider";
import { Clock } from "../../../../components/Clock";
import Styles from "./TimerClock.module.less";

export const TimerClock = () => {
	const [state, { setMultiplier, togglePause, resume, pause }] = useContext(CampaignContext);

	const onPressMultiplier = (multiplier: number) => {
		if (state.winner == null) {
			setMultiplier?.(multiplier);
			resume?.();
		}
	};

	createEffect(() => {
		if (state.winner == null) {
			return;
		}

		pause?.();
	});
	return (
		<div class={Styles.wrapper}>
			<div class={Styles.clock}>
				<Clock value={state.timer} withDay />
			</div>

			<div class={Styles.buttons}>
				<Components.Button onPress={() => togglePause?.()} unstyled class={Styles.icon}>
					{state.paused ? <Components.Icons.PauseFill /> : <Components.Icons.Pause />}
				</Components.Button>
				<Components.Button onPress={() => onPressMultiplier?.(1)} unstyled class={Styles.icon}>
					{!state.paused && state.multiplier === 1 ? <Components.Icons.PlayFill /> : <Components.Icons.Play />}
				</Components.Button>
				<Components.Button onPress={() => onPressMultiplier?.(300)} unstyled class={Styles.icon}>
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
