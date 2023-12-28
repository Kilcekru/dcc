import { WaypointTemplate, WaypointTemplateProps } from "./Template";

export class GenericWaypointTemplate extends WaypointTemplate {
	constructor(args: WaypointTemplateProps) {
		super({
			name: "Landing",
			onGround: true,
			position: args.position,
			type: "Landing",
		});
	}

	public static create(args: WaypointTemplateProps) {
		return new GenericWaypointTemplate(args);
	}
}
