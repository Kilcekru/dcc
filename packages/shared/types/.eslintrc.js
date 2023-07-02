module.exports = {
	extends: [require.resolve("@kilcekru/ts-basics/.eslintrc.js")],
	env: {
		es2021: true,
	},
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
};
