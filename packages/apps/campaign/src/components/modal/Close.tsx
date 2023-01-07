import "./Close.less";

import { Button } from "../button";
import * as Icons from "../icons";

export const Close = (props: { onPress: () => void }) => {
	return (
		<Button onPress={() => props.onPress()}>
			<Icons.Close />
		</Button>
	);
};
