import { cnb } from "cnbuilder";

import Styles from "./Item.module.less";

export function Flag(props: { countryName: string | undefined }) {
	const flagCountry = () => {
		switch (props.countryName) {
			case "USA":
				return Styles.usa;
			case "France":
				return Styles.france;
			case "Russia":
				return Styles.russia;
			case "Spain":
				return Styles.spain;
			default:
				return;
		}
	};

	return <div class={cnb(Styles.flag, flagCountry())} />;
}
