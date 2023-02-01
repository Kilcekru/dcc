module.exports = {
	extends: [require.resolve("../../../utils/config/.eslintrc.ui.js")],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
};
