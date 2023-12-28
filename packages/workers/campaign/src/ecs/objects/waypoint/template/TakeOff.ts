import * as Utils from "@kilcekru/dcc-shared-utils";

import { HomeBase } from "../../../entities";
import { WaypointTemplate, WaypointTemplateProps } from "./Template";

export type TakeoffWaypointTemplateProps = Pick<WaypointTemplateProps, "position">;

export interface CreateTakeoffWaypointTemplateProps {
	homeBase: HomeBase;
}

export class TakeoffWaypointTemplate extends WaypointTemplate {
	constructor(args: TakeoffWaypointTemplateProps) {
		super({
			name: "Take Off",
			onGround: true,
			position: args.position,
			duration: Utils.DateTime.Minutes(10),
			type: "TakeOff",
		});
	}

	static create(args: CreateTakeoffWaypointTemplateProps) {
		return new TakeoffWaypointTemplate(args.homeBase);
	}
}
