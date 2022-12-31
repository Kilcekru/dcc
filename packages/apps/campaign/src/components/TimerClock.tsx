import { useContext } from "solid-js";

import { Button } from "./button";
import { CampaignContext } from "./CampaignProvider";
import { Clock } from "./Clock";

export const TimerClock = () => {
	const [state, { setMultiplier, togglePause }] = useContext(CampaignContext);

	return (
		<div>
			<Clock value={state.timer} />
			<Button onPress={() => togglePause?.()}>{state.paused ? "Resume" : "Pause"}</Button>
			<Button onPress={() => setMultiplier?.(1)}>1</Button>
			<Button onPress={() => setMultiplier?.(60)}>60</Button>
			<Button onPress={() => setMultiplier?.(600)}>600</Button>
		</div>
	);
};
