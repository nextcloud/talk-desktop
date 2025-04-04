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
				AUTHENTICATION_WINDOW_WEBPACK_ENTRY: 'readonly',
				AUTHENTICATION_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				CALLBOX_WINDOW_PRELOAD_WEBPACK_ENTRY: 'readonly',
				CALLBOX_WINDOW_WEBPACK_ENTRY: 'readonly',
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
				__IS_DESKTOP__: 'readonly',
				__CHANNEL__: 'readonly',
				__VERSION_TAG__: 'readonly',
				__TALK_VERSION_TAG__: 'readonly',
				__BUILD_CONFIG__: 'readonly',
				// Electron
				...globals.node,
			},
		},
		settings: {
			jsdoc: {
				tagNamePreference: {
					return: 'return', // TODO: upstream
				},
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
	// TODO: upstream
	{
		rules: {
			'jsdoc/check-tag-names': ['error', { typed: false }], // TODO: upstream
			'jsdoc/no-types': 'off', // TODO: upstream
			'@stylistic/newline-per-chained-call': 'off', // TODO: upstream
			'@stylistic/array-bracket-newline': ['error', { multiline: true }], // TODO: upstream
			'@stylistic/array-element-newline': ['error', 'consistent'], // TODO: upstream
			'@stylistic/object-property-newline': 'off', // TODO: upstream
			'prefer-template': 'off', // TODO: upstream
			'no-use-before-define': ['error', { functions: false }], // TODO: upstream
		},
	},
	{
		files: ['**/*.ts', '**/*.vue'],
		rules: {
			'@typescript-eslint/no-shadow': 'off', // TODO: upstream
			'@typescript-eslint/no-use-before-define': ['error', { functions: false }], // TODO: upstream
		},
	},
	{
		files: ['**/*.vue'],
		rules: {
			'vue/require-prop-comment': 'off', // TODO: upstream
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
			'vue/component-name-in-template-casing': 'error',
			'vue/component-options-name-casing': 'error',
			// 'vue/custom-event-name-casing': 'error', // TODO: enable with Vue 3
			'vue/define-emits-declaration': 'error',
			'vue/match-component-file-name': 'error',
			// 'vue/no-bare-strings-in-template': 'error', // TODO: Enable with l10n
			'vue/new-line-between-multi-line-property': 'error',
			'vue/no-duplicate-attr-inheritance': 'error',
			'vue/no-potential-component-option-typo': 'error',
			'vue/no-ref-object-reactivity-loss': 'error',
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
	},
]
