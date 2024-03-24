import * as Components from "@kilcekru/dcc-lib-components";
import { cnb } from "cnbuilder";
import { Show } from "solid-js";

import Styles from "./Item.module.less";

export function Flag(props: { countryName: string | undefined }) {
	return (
		<Show when={props.countryName != null}>
			{/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
			<Components.Flag class={cnb(Styles.flag)} countryName={props.countryName!} />
		</Show>
	);
}
