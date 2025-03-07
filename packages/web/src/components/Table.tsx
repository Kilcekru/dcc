import { flexRender } from "@tanstack/react-table";
import type { Cell, Column, RowData, Table as TanTable } from "@tanstack/table-core";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";
import { EllipsisVertical } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "../lib/utils";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		filterVariant?: "select" | "booleanSelect" | "input";
		maxWidth?: number;
		minWidth?: number;
	}
}

// A typical debounced input react component
function DebouncedInput({
	value: initialValue,
	onChange,
	debounce = 100,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
	const [value, setValue] = React.useState(initialValue);

	React.useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	React.useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);

		return () => clearTimeout(timeout);
	}, [value]);

	return (
		<input {...props} value={value} onChange={(e) => setValue(e.target.value)} className="w-full bg-transparent" />
	);
}

function Select<DataType>({ column }: { column: Column<DataType, unknown> }) {
	const sortedUniqueValues = React.useMemo(
		() => Array.from(column.getFacetedUniqueValues().keys()).sort().slice(0, 5000),
		[column.getFacetedUniqueValues()],
	);

	return (
		<RadioGroup
			onValueChange={(value) => column.setFilterValue(value)}
			value={column.getFilterValue() as string | undefined}
		>
			{sortedUniqueValues.map((value) => {
				const id = `option-${value}`;
				return (
					<div className="flex items-center space-x-2" key={id}>
						<RadioGroupItem value={value} id={id} />
						<Label htmlFor={id}>{value}</Label>
					</div>
				);
			})}
		</RadioGroup>
	);
}

function BooleanSelect<DataType>({ column }: { column: Column<DataType, unknown> }) {
	console.log(column.getFilterValue());

	const value = column.getFilterValue() as boolean | undefined;
	return (
		<RadioGroup
			onValueChange={(value) => column.setFilterValue(value === "yes" ? true : false)}
			value={value === true ? "yes" : value === false ? "no" : undefined}
		>
			<div className="flex items-center space-x-2" key={"yes"}>
				<RadioGroupItem value={"yes"} id={"option-yes"} />
				<Label htmlFor={"option-yes"}>Yes</Label>
			</div>
			<div className="flex items-center space-x-2" key={"no"}>
				<RadioGroupItem value={"no"} id={"option-no"} />
				<Label htmlFor={"option-no"}>No</Label>
			</div>
		</RadioGroup>
	);
}

function Filter<DataType>({ column }: { column: Column<DataType, unknown> }) {
	const { filterVariant } = column.columnDef.meta ?? {};
	const columnFilterValue = column.getFilterValue();

	if (filterVariant === "select") {
		return <Select column={column} />;
	}

	if (filterVariant === "booleanSelect") {
		return <BooleanSelect column={column} />;
	}

	return (
		<DebouncedInput
			className="w-36 rounded border text-black shadow"
			onChange={(value) => column.setFilterValue(value)}
			placeholder={`Search...`}
			type="text"
			value={(columnFilterValue ?? "") as string}
		/>
	);
}

export type TableProps<DataType> = {
	table: TanTable<DataType>;
	cell?: (cell: Cell<DataType, unknown>, i?: number) => React.ReactNode;
};
export function Table<DataType>({ cell, table }: TableProps<DataType>) {
	return (
		<table className="w-full table-auto">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header, i) => {
							return (
								<th key={header.id} className={cn("p-2 text-start", { "hidden sm:table-cell": (i ?? 0) > 1 })}>
									<div className="flex justify-between">
										<button onClick={() => header.column.toggleSorting()}>
											{flexRender(header.column.columnDef.header, header.getContext())}
										</button>
										{header.column.getCanFilter() ? (
											<Popover>
												<>
													<PopoverTrigger>
														<EllipsisVertical />
													</PopoverTrigger>
													<PopoverContent>
														<Filter column={header.column} />
													</PopoverContent>
												</>
											</Popover>
										) : null}
									</div>
								</th>
							);
						})}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => {
					return (
						<tr key={row.id} className="hover:bg-neutral-900">
							{cell == null
								? row.getVisibleCells().map((cell, i) => {
										return (
											<td key={cell.id} className={cn({ underline: i === 0 })}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})
								: row.getVisibleCells().map(cell)}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}
