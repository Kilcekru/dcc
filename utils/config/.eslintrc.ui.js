module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	plugins: ["css-modules"],
	extends: [
		require.resolve("@kilcekru/ts-basics/.eslintrc.js"),
		"plugin:solid/recommended",
		"plugin:css-modules/recommended",
	],
};
