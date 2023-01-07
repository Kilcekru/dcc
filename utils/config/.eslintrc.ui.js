module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [require.resolve("@kilcekru/ts-basics/.eslintrc.js"), "plugin:solid/recommended"],
};
