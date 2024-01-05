import { WaypointTemplate, WaypointTemplateProps } from "./Template";

export class GenericWaypointTemplate extends WaypointTemplate {
	constructor(args: WaypointTemplateProps) {
		super(args);
	}

	public static create(args: WaypointTemplateProps) {
		return new GenericWaypointTemplate(args);
	}
}
