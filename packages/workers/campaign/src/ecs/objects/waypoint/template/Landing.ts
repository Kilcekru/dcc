import { HomeBase } from "../../../entities";
import { WaypointTemplate, WaypointTemplateProps } from "./Template";

export type LandingWaypointTemplateProps = Pick<WaypointTemplateProps, "position">;

export interface CreateLandingWaypointTemplateProps {
	homeBase: HomeBase;
}

export class LandingWaypointTemplate extends WaypointTemplate {
	constructor(args: LandingWaypointTemplateProps) {
		super({
			name: "Landing",
			onGround: true,
			position: args.position,
			type: "Landing",
		});
	}

	public static create(args: CreateLandingWaypointTemplateProps) {
		return new LandingWaypointTemplate(args.homeBase);
	}
}
