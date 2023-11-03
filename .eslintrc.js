module.exports = {
	extends: [
		// https://github.com/nextcloud/eslint-config/
		'@nextcloud',
		'plugin:vue/recommended',
	],

	parserOptions: {
		ecmaVersion: 'latest',
	},

	globals: {
		// Electron Forge build vars
		AUTHENTICATION_WINDOW_WEBPACK_ENTRY: 'readonly',
		AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
		TALK_WINDOW_WEBPACK_ENTRY: 'readonly',
		TALK_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
		HELP_WINDOW_WEBPACK_ENTRY: 'readonly',
		HELP_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
		UPGRADE_WINDOW_WEBPACK_ENTRY: 'readonly',
		UPGRADE_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
		WELCOME_WINDOW_WEBPACK_ENTRY: 'readonly',
		WELCOME_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
		// Build constants
		IS_DESKTOP: 'readonly',
	},

	settings: {
		'import/extensions': [
			'.js',
			'.vue',
		],
	},

	rules: {
		/**
		 * ESLint
		 */
		'no-console': 'off', // TODO: remove after preview
		/**
		 * jsdoc
		 *
		 * @see https://github.com/gajus/eslint-plugin-jsdoc
		 */
		// 'jsdoc/require-param-description': 'off',
		/**
		 * Node
		 *
		 * @see https://github.com/eslint-community/eslint-plugin-n/
		 */
		'n/no-unpublished-import': 'off',
		'n/no-callback-literal': 'off', // conflicts with Electron API
		'n/no-missing-import': 'off', // TODO: Find a way to configure @talk alias
		'n/no-missing-require': 'off',
		'n/no-extraneous-import': ['error', {
			// These modules are resolved with Webpack Provide plugin
			allowModules: [
				'@nextcloud/auth',
				'@nextcloud/axios',
				'@nextcloud/initial-state',
				'@nextcloud/notify_push',
				'@nextcloud/router',
			],
		}],
		/**
		 * import
		 *
		 * @see https://github.com/import-js/eslint-plugin-import
		 */
		'import/no-unresolved': 'off', // TODO: Find a way to configure @talk alias
		/**
		 * Vue
		 *
		 * @see https://eslint.vuejs.org
		 */
		/** Vue / Priority A: Essentials */
		// All rules enabled
		// This rule is disabled in @nextcloud - re-enable
		'vue/multi-word-component-names': 'error',
		/** Vue / Priority B: Strongly Recommended */
		// All Rules enabled
		/** Vue / Priority C: Recommended */
		// All Rules enabled
		/** Vue / Uncategorized */
		'vue/attribute-hyphenation': 'error',
		'vue/component-name-in-template-casing': 'error',
		'vue/component-options-name-casing': 'error',
		// 'vue/custom-event-name-casing': 'error',
		'vue/define-emits-declaration': 'error',
		'vue/match-component-file-name': 'error',
		// 'vue/no-bare-strings-in-template': 'error', // TODO: Enable with l10n
		'vue/new-line-between-multi-line-property': 'error',
		'vue/no-duplicate-attr-inheritance': 'error',
		'vue/no-potential-component-option-typo': 'error',
		'vue/no-ref-object-destructure': 'error',
		'vue/no-undef-components': 'error',
		'vue/no-undef-properties': 'error',
		'vue/no-unused-properties': 'error', // TODO: Experiment
		'vue/no-useless-mustaches': 'error',
		'vue/no-useless-v-bind': 'error',
		'vue/padding-line-between-blocks': 'error',
		'vue/prefer-separate-static-class': 'error',
		'vue/prefer-true-attribute-shorthand': 'error',
		'vue/require-name-property': 'error',
	},
}
