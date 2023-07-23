import * as Types from "@kilcekru/dcc-shared-types";
import { Match, Switch } from "solid-js";

import { Briefing } from "./campaign/briefing";
import Style from "./Document.module.less";

export function Document(props: { document: Types.Capture.Document }) {
	return (
		<div class={Style.documentContainer}>
			<Switch>
				<Match when={props.document.type === "campaign.briefing"}>
					<Briefing data={props.document.data} />
				</Match>
			</Switch>
		</div>
	);
}
