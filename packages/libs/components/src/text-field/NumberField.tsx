import { TextField, TextFieldProps } from "./TextField";

export function NumberField(
	props: Omit<TextFieldProps, "type" | "value" | "onChange"> & { value: number; onChange: (value: number) => void },
) {
	return (
		<TextField
			{...props}
			value={String(props.value)}
			onChange={(value) => props.onChange(Number(value))}
			type="number"
		/>
	);
}
