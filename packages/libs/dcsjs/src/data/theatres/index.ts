import { Theatre } from "../enums";
import { TheatreData } from "../types";
import { Afghanistan } from "./afghanistan";
import { Caucasus } from "./caucasus";
import { PersianGulf } from "./persianGulf";
import { Syria } from "./syria";

export const Theatres = {
	Afghanistan,
	Caucasus,
	Normandy: Caucasus,
	PersianGulf,
	SouthAtlantic: Caucasus,
	Syria,
} satisfies Record<Theatre, TheatreData>;
