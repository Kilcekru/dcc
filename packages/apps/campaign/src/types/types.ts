export type Faction = {
	id: string;
	name: string;
};

export type FactionStore = Faction & {
	airdromes: Array<string>;
	planes: Array<string>;
};
