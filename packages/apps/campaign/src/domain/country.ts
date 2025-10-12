export function countryNameToCode(countryName: string) {
	switch (countryName) {
		case "Austria":
			return "at";
		case "France":
			return "fr";
		case "Germany":
			return "de";
		case "Iran":
			return "ir";
		case "Iraq":
			return "iq";
		case "Israel":
			return "il";
		case "Russia":
			return "ru";
		case "Sweden":
			return "se";
		case "USA":
			return "us";
		default:
			return "us";
	}
}
