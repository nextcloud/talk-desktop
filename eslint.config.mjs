/*!
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { recommended } from '@nextcloud/eslint-config'
import globals from 'globals'

export default [
	// Nextcloud ESLint config
	...recommended,

	{
		name: 'talk-desktop/config',
		ignores: ['src/shared/renderer/assets/**/*'],
		languageOptions: {
			globals: {
				// Electron Forge build vars
				TALK_DESKTOP__WINDOW_AUTHENTICATION_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_DESKTOP__WINDOW_CALLBOX_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_DESKTOP__WINDOW_CERTIFICATE_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_DESKTOP__WINDOW_TALK_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_DESKTOP__WINDOW_HELP_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_DESKTOP__WINDOW_UPGRADE_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_DESKTOP__WINDOW_WELCOME_PRELOAD_WEBPACK_ENTRY: 'readonly',
				// Build constants
				IS_DESKTOP: 'readonly',
				__IS_DESKTOP__: 'readonly',
				__CHANNEL__: 'readonly',
				__VERSION_TAG__: 'readonly',
				__TALK_VERSION_TAG__: 'readonly',
				__BUILD_CONFIG__: 'readonly',
				// Electron main process
				...globals.node,
			},
		},
	},
	{
		name: 'talk-desktop/rules/general',
		rules: {
			'no-console': 'off',
			// Talk Desktop doesn't use real Nextcloud server globals
			'@nextcloud/no-deprecations': 'off',
			'@nextcloud/no-removed-apis': 'off',
		},
	},
	{
		name: 'talk-desktop/rules/dts',
		files: ['**/*.d.ts'],
		rules: {
			'@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
		},
	},
	{
		// See: https://github.com/nextcloud-libraries/eslint-config/pull/995
		name: 'talk-desktop/rules/vue-documentation-mixed',
		files: ['**/*.vue'],
		rules: {
			// Vue files can be both JavaScript and TypeScript
			// Try to apply TS files only for functions with TS definitions
			'jsdoc/no-types': [
				'error', {
					contexts: [
						'FunctionDeclaration:has(TSTypeAnnotation)',
						'FunctionExpression:has(TSTypeAnnotation)',
						'ArrowFunctionExpression:has(TSTypeAnnotation)',
						'MethodDefinition:has(TSTypeAnnotation)',
					],
				},
			],
			'jsdoc/require-param-type': [
				'error', {
					contexts: [
						'FunctionDeclaration:not(:has(TSTypeAnnotation))',
						'FunctionExpression:not(:has(TSTypeAnnotation))',
						'ArrowFunctionExpression:not(:has(TSTypeAnnotation))',
						'MethodDefinition:not(:has(TSTypeAnnotation))',
					],
				},
			],
			// Unlike params, return values are often inferred and not explicitly typed
			'jsdoc/require-returns-type': 'off',
			// Unfortunately, we cannot check when it is used in TS context and when not
			'jsdoc/check-tag-names': ['error', { typed: false }],
		},
	},
	{
		name: 'talk-desktop/rules/zx-scripts',
		files: ['scripts/**/*.mjs'],
		rules: {
			// Let TypeScript handle undefined variables instead of ESLint
			'no-undef': 'off',
		},
	},
	{
		name: 'talk-desktop/rules/vue-strict',
		files: ['**/*.vue'],
		rules: {
			// This rule is disabled in @nextcloud - re-enable
			'vue/multi-word-component-names': 'error',
			'vue/attribute-hyphenation': 'error',
			'vue/block-order': ['error', { order: ['script', 'template', 'style'] }], // Follow new Vue standards
			'vue/component-api-style': ['error', ['script-setup']], // Follow new Vue standards
			'vue/component-options-name-casing': 'error',
			// 'vue/custom-event-name-casing': 'error', // TODO: enable with Vue 3
			'vue/define-emits-declaration': 'error',
			'vue/no-duplicate-attr-inheritance': 'error',
			'vue/no-potential-component-option-typo': 'error',
			'vue/no-ref-object-reactivity-loss': 'error',
			'vue/no-undef-properties': 'error',
			'vue/no-useless-v-bind': 'error',
			'vue/prefer-separate-static-class': 'error',
			'vue/prefer-true-attribute-shorthand': 'error',
			'vue/require-name-property': 'error',
		},
	},
]
