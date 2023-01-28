import { useContext } from "solid-js";

import { Button } from "../../../../components/button";
import { CampaignContext } from "../../../../components/CampaignProvider";
import { Clock } from "../../../../components/Clock";
import * as Icons from "../../../../components/icons";
import styles from "./TimerClock.module.less";

export const TimerClock = () => {
	const [state, { setMultiplier, togglePause, resume }] = useContext(CampaignContext);

	const onPressMultiplier = (multiplier: number) => {
		setMultiplier?.(multiplier);
		resume?.();
	};

	return (
		<div>
			<Clock value={state.timer} />

			<Button onPress={() => togglePause?.()} unstyled class={styles.icon}>
				{state.paused ? <Icons.Play /> : <Icons.Pause />}
			</Button>
			<Button onPress={() => onPressMultiplier(1)}>1</Button>
			<Button onPress={() => onPressMultiplier(60)}>60</Button>
			<Button onPress={() => onPressMultiplier(600)}>600</Button>
		</div>
	);
};
