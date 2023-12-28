import * as Utils from "@kilcekru/dcc-shared-utils";

import { GenericWaypointTemplate } from "./Generic";
import { WaypointTemplate, WaypointTemplateProps } from "./Template";

export type HoldWaypointTemplateProps = Pick<WaypointTemplateProps, "position">;

export class HoldWaypointTemplate extends WaypointTemplate {
	constructor(args: HoldWaypointTemplateProps) {
		super({
			name: "Hold",
			onGround: false,
			position: args.position,
			duration: Utils.Config.defaults.holdWaypointDuration,
			type: "Hold",
		});
	}

	public toEscortWaypoint() {
		return new GenericWaypointTemplate({
			name: "Escort",
			onGround: false,
			position: this.position,
			type: "Task",
		});
	}

	public static create(args: HoldWaypointTemplateProps) {
		return new HoldWaypointTemplate(args);
	}
}
