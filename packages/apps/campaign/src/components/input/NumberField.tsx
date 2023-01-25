export const NumberField = (props: { value: number; onChange: (value: number) => void }) => {
	return <input value={props.value} onChange={(e) => props.onChange(Number(e.currentTarget.value))} />;
};
