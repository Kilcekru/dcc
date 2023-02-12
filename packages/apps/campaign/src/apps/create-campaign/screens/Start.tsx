import { Button } from "../../../components";
import styles from "./Start.module.less";

export const Start = (props: { next: () => void }) => {
	return (
		<>
			<h1 class={styles.title}>Red Waters</h1>
			<h2 class={styles.subtitle}>Dynamic Campaign</h2>
			<p>
				In May 2004, the conflict between Russia-Georgia escalated into a full-scale military conflict, with Russia
				military forces launching an invasion of Georgia.{" "}
			</p>
			<p>
				The United States, along with several other Western nations, came to the aid of Georgia during the conflict. The
				U.S. provided diplomatic, economic, and military support to Georgia, including the deployment of military
				forces.
			</p>
			<p>
				Main goal for the NATO coalition is the <strong>recapture of the Enguri Dam</strong>. To limit the damage to the
				Geogian infrastructure
			</p>
			<Button onPress={() => props.next()} large class={styles.button}>
				Start Campaign
			</Button>
		</>
	);
};
