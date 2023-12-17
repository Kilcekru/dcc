import type * as DcsJs from "@foxdelta2/dcsjs";

export interface BuildingProps {
	name: string;
	alive: boolean;
	offset: DcsJs.Position;
}
export class Building {
	public readonly name: string;
	#alive: boolean;
	public readonly offset: DcsJs.Position;

	get alive() {
		return this.#alive;
	}

	constructor(args: BuildingProps) {
		this.name = args.name;
		this.#alive = args.alive;
		this.offset = args.offset;
	}

	toJSON() {
		return {
			name: this.name,
			alive: this.#alive,
			offset: this.offset,
		};
	}
}
