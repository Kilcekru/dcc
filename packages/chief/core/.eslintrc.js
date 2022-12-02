module.exports = {
	extends: [require.resolve("@kilcekru/ts-basics/.eslintrc.node.js")],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
};
