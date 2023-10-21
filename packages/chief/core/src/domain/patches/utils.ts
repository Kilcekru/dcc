export function createLineRegex(search: string) {
	return new RegExp(`(?<=\\r?\\n)(?<ws>[\\t ]*)${escapeForRegex(search)}[\\t ]*(?=\\r?\\n)`, "g");
}

function escapeForRegex(value: string): string {
	return value.replace(/[. ()]/g, (value) => {
		switch (value) {
			case ".":
				return "\\.";
			case " ":
				return "[\\t ]*";
			case "(":
				return "\\(";
			case ")":
				return "\\)";
			default:
				throw new Error("escapeForRegex: invalid replacement");
		}
	});
}
