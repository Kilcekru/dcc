import * as DcsJs from "@foxdelta2/dcsjs";

import { WaypointTemplate } from "./Template";

export interface RaceTrackWaypointTemplateProps {
	duration: number;
	positions: {
		from: DcsJs.Position;
		to: DcsJs.Position;
	};
}

export class RaceTrackWaypointTemplate extends WaypointTemplate {
	constructor(args: RaceTrackWaypointTemplateProps) {
		super({
			name: "Race-Track Start",
			onGround: true,
			position: args.positions.from,
			raceTrack: {
				name: "Race-Track End",
				position: args.positions.to,
			},
			duration: args.duration,
			type: "Task",
		});
	}

	public static create(args: RaceTrackWaypointTemplateProps) {
		return new RaceTrackWaypointTemplate(args);
	}
}
