export const TextField = (props: { value: string; onChange: (value: string) => void }) => {
	return <input value={props.value} onChange={(e) => props.onChange(e.currentTarget.value)} />;
};
