import * as Components from "@kilcekru/dcc-lib-components";
import { createEffect, useContext } from "solid-js";

import { CampaignContext } from "../../../../components/CampaignProvider";
import { useSave } from "../../../../hooks";
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

	createEffect(() => {
		if (state.winner == null) {
			return;
		}

		pause?.();
	});

	createEffect(() => {
		if (!state.paused && state.startTimeReached) {
			pause?.();
		}
	});

	const onPause = () => {
		pause?.();
		save();
	};

	return (
		<div class={Styles.wrapper}>
			<div class={Styles.clock}>
				<Components.Clock value={state.time} withDay />
			</div>

			<Components.Tooltip text="Takeoff Time reached" disabled={!state.startTimeReached}>
				<div class={Styles.buttons}>
					<Components.Button onPress={onPause} unstyled class={Styles.icon}>
						{state.paused ? <Components.Icons.PauseFill /> : <Components.Icons.Pause />}
					</Components.Button>
					<Components.Button
						onPress={() => onPressMultiplier?.(1)}
						unstyled
						class={Styles.icon}
						disabled={state.startTimeReached}
					>
						{!state.paused && state.timeMultiplier === 1 ? <Components.Icons.PlayFill /> : <Components.Icons.Play />}
					</Components.Button>
					<Components.Button
						onPress={() => onPressMultiplier?.(300)}
						unstyled
						class={Styles.icon}
						disabled={state.startTimeReached}
					>
						{!state.paused && state.timeMultiplier > 1 ? (
							<Components.Icons.FastForwardFill />
						) : (
							<Components.Icons.FastForward />
						)}
					</Components.Button>
				</div>
			</Components.Tooltip>
		</div>
	);
};
