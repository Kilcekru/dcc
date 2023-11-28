import * as DcsJs from "@foxdelta2/dcsjs";

export interface BuildingProps {
	name: string;
	alive: boolean;
	offset: DcsJs.Position;
}
export class Building {
	public name: string;
	public alive: boolean;
	public offset: DcsJs.Position;

	constructor(args: BuildingProps) {
		this.name = args.name;
		this.alive = args.alive;
		this.offset = args.offset;
	}
}
