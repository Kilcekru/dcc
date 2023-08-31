import * as Components from "@kilcekru/dcc-lib-components";
import { Match, Switch, useContext } from "solid-js";

import { CampaignContext } from "../../../../components";
import * as Domain from "../../../../domain";
import Styles from "./Weather.module.less";

export const Weather = () => {
	const [state] = useContext(CampaignContext);
	const cloudCoverPreset = Domain.Weather.getCloudPreset(state.weather.cloudCover);

	return (
		<div class={Styles.wrapper}>
			<Switch>
				<Match when={cloudCoverPreset === "Overcast"}>
					<Components.Icons.CloudFill />
				</Match>
				<Match when={cloudCoverPreset === "Clear"}>
					<Components.Icons.SunFill />
				</Match>
				<Match when={cloudCoverPreset === "Rain"}>
					<Components.Icons.CloudRainFill />
				</Match>
				<Match when={cloudCoverPreset === "Scattered"}>
					<Components.Icons.CloudSunFill />
				</Match>
			</Switch>
			{state.weather.temperature}°C
		</div>
	);
};
