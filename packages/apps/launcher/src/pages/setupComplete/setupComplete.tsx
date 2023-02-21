interface SetupCompleteProps {
	onContinue: () => void;
}

export const SetupComplete = (props: SetupCompleteProps) => {
	return (
		<>
			<h2>Installation successfull</h2>
			<div>
				<p>Digital Crew Chief has been installed.</p>
				<p>A shortcut to start DCC has been placed on your Desktop.</p>
				<p>You can now delete the setup file.</p>
			</div>
			<div>
				<button onClick={() => props.onContinue()}>Continue</button>
			</div>
		</>
	);
};
