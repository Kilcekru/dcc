import * as DcsJs from "@foxdelta2/dcsjs";
import * as Types from "@kilcekru/dcc-shared-types";

export interface WaypointTemplateProps {
	name: string;
	onGround?: boolean;
	position: DcsJs.Position;
	duration?: number;
	type: Types.Serialization.WaypointType;
	raceTrack?: {
		name: string;
		position: DcsJs.Position;
	};
}

export abstract class WaypointTemplate {
	public readonly name: string;
	public readonly position: DcsJs.Position;
	public readonly onGround: boolean;
	public readonly duration: number | undefined;
	public readonly type: Types.Serialization.WaypointType;
	public readonly racetrack:
		| {
				name: string;
				position: DcsJs.Position;
		  }
		| undefined;

	protected constructor(args: WaypointTemplateProps) {
		this.name = args.name;
		this.position = args.position;
		this.onGround = args.onGround ?? false;
		this.duration = args.duration;
		this.type = args.type;
		this.racetrack = args.raceTrack;
	}

	public serialize(): Types.Serialization.WaypointTemplateSerialized {
		return {
			name: this.name,
			position: this.position,
			onGround: this.onGround,
			duration: this.duration,
			type: this.type,
			raceTrack: this.racetrack,
		};
	}
}
