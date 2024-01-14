export namespace String {
	export function asc(a: string, b: string) {
		return a.localeCompare(b);
	}

	export function desc(a: string, b: string) {
		return a.localeCompare(b) * -1;
	}
}

export namespace Number {
	export function asc(a: number, b: number) {
		return a - b;
	}

	export function desc(a: number, b: number) {
		return b - a;
	}
}
