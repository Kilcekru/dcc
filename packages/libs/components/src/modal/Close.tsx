import { Button } from "../button";
import { Icons } from "../icons";
import styles from "./Close.module.less";

export const Close = (props: { onPress: () => void }) => {
	return (
		<Button onPress={() => props.onPress()} class={styles["modal-close"]}>
			<Icons.Close />
		</Button>
	);
};
