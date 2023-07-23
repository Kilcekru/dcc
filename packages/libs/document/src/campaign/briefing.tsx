import * as Types from "@kilcekru/dcc-shared-types";

export function Briefing(props: { data: Types.Campaign.BriefingDocument }) {
	return <div>{props.data.text}</div>;
}
