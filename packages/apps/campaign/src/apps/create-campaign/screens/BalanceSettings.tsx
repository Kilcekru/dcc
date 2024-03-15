import Styles from "./Settings.module.less";

export function BalanceSettings() {
	return (
		<div>
			<h1 class={Styles.title}>How many Air to Air aircraft should the enemy have?</h1>
			<input type="range" id="vol" name="vol" min="0" max="5" />
			<p>None. I just want to flight Air to Ground</p>
			<p>Default. The enemy will have some aircrafts</p>
			<p>The more the better</p>
		</div>
	);
}
