/**
 * SPDX-FileCopyrightText: 2022 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// eslint.config.js

import { recommendedVue2 } from '@nextcloud/eslint-config'
import globals from 'globals'

export default [
	// Nextcloud ESLint config
	...recommendedVue2,
	// Ignore Nextcloud Server styles - requested from server
	{
		ignores: ['src/shared/renderer/assets/**/*'],
	},
	// Configuration
	{
		languageOptions: {
			globals: {
				// Electron Forge build vars
				AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				CALLBOX_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				TALK_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				HELP_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				UPGRADE_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				WELCOME_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				// Build constants
				IS_DESKTOP: 'readonly',
				__IS_DESKTOP__: 'readonly',
				__CHANNEL__: 'readonly',
				__VERSION_TAG__: 'readonly',
				__TALK_VERSION_TAG__: 'readonly',
				__BUILD_CONFIG__: 'readonly',
				// Electron
				...globals.node,
			},
		},
	},
	// Rules and overrides
	{
		rules: {
			/**
			 * ESLint
			 */
			'no-console': 'off', // TODO: remove after preview
			/**
			 * Nextcloud
			 */
			// Talk Desktop doesn't use real Nextcloud server globals
			'@nextcloud/no-deprecations': 'off',
			'@nextcloud/no-removed-apis': 'off',
		},
	},
	{
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
	// Additional Vue rules
	{
		files: ['**/*.vue'],
		rules: {
			/** ESLint Plugin Vue (https://eslint.vuejs.org) */

			/** Vue / Priority A: Essentials */
			// All rules enabled
			// This rule is disabled in @nextcloud - re-enable
			'vue/multi-word-component-names': 'error',
			/** Vue / Priority B: Strongly Recommended */
			/** Vue / Priority C: Recommended */
			/** Vue / Uncategorized */
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
