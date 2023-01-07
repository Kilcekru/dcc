import { useContext } from "solid-js";

import { Button } from "./button";
import { CampaignContext } from "./CampaignProvider";
import { Clock } from "./Clock";

export const TimerClock = () => {
	const [state, { setMultiplier, togglePause, resume }] = useContext(CampaignContext);

	const onPressMultiplier = (multiplier: number) => {
		setMultiplier?.(multiplier);
		resume?.();
	};
	return (
		<div>
			<Clock value={state.timer} />
			<Button onPress={() => togglePause?.()}>{state.paused ? "Resume" : "Pause"}</Button>
			<Button onPress={() => onPressMultiplier(1)}>1</Button>
			<Button onPress={() => onPressMultiplier(60)}>60</Button>
			<Button onPress={() => onPressMultiplier(600)}>600</Button>
		</div>
	);
};
