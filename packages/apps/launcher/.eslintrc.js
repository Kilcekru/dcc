module.exports = {
	extends: ["../../../utils/config/.eslintrc.ui.js"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
	},
};
