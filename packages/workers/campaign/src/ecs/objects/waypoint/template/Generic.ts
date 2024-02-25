import * as Types from "@kilcekru/dcc-shared-types";

import { WaypointTemplate, WaypointTemplateProps } from "./Template";
export class GenericWaypointTemplate extends WaypointTemplate {
	constructor(args: WaypointTemplateProps) {
		super(args);
	}

	public static create(args: WaypointTemplateProps) {
		return new GenericWaypointTemplate(args);
	}

	static deserialize(args: Types.Serialization.WaypointTemplateSerialized) {
		return new GenericWaypointTemplate(args);
	}
}
