import * as DcsJs from "@foxdelta2/dcsjs";

export const opposite = (coalition: DcsJs.Coalition | undefined): DcsJs.Coalition => {
	if (coalition === "blue") {
		return "red";
	} else if (coalition === "red") {
		return "blue";
	} else {
		return "neutrals";
	}
};
