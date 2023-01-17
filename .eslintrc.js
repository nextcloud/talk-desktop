module.exports = {
	extends: [
		'@nextcloud',
	],

	rules: {
		'jsdoc/require-param-description': 'off',
		'no-console': 'off',
		'import/extensions': ['error', { commonjs: false, module: true }],
		'n/no-unpublished-import': 'off',
		'n/no-callback-literal': 'off', // conflicts with Electron API
	},
}
