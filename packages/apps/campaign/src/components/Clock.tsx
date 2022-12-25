import { useContext } from "solid-js";

import { Button, CampaignContext } from "./index";

const formatTime = (value: number) => {
	if (value >= 10) {
		return value.toString();
	} else {
		return `0${value.toString()}`;
	}
};

export const Clock = () => {
	const [state, { setMultiplier, togglePause }] = useContext(CampaignContext);
	const date = () => new Date(state.timer * 1000);

	return (
		<div>
			{formatTime(date().getHours() - 1)}:{formatTime(date().getMinutes())}:{formatTime(date().getSeconds())}
			<Button onPress={() => togglePause?.()}>{state.paused ? "Resume" : "Pause"}</Button>
			<Button onPress={() => setMultiplier?.(1)}>1</Button>
			<Button onPress={() => setMultiplier?.(60)}>60</Button>
			<Button onPress={() => setMultiplier?.(600)}>600</Button>
		</div>
	);
};
