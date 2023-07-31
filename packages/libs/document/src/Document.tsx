import * as Types from "@kilcekru/dcc-shared-types";
import { Match, Switch } from "solid-js";

import * as CampaignDocuments from "./campaign/";
import Style from "./Document.module.less";

export function Document(props: { document: Types.Capture.Document }) {
	return (
		<div class={Style.documentContainer}>
			<Switch>
				<Match when={props.document.type === "campaign.briefing"}>
					<CampaignDocuments.Briefing data={props.document.data as Types.Campaign.BriefingDocument} />
				</Match>
				<Match when={props.document.type === "campaign.test"}>
					<CampaignDocuments.Test data={props.document.data as { text: string }} />
				</Match>
			</Switch>
		</div>
	);
}
