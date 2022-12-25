import { Button } from "../../../components";

export const Start = (props: { next: () => void }) => {
	return (
		<div>
			<h1>Welcome to the DCC - Campaign</h1>
			<Button onPress={() => props.next()}>Create Campaign</Button>
		</div>
	);
};
