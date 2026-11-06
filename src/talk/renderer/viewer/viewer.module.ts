/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { IHandler } from '@nextcloud/viewer'

import { registerHandler } from '@nextcloud/viewer'
import { defineCustomElement } from 'vue'

/**
 * Register a viewer handler for Talk Desktop Viewer via `@nextcloud/viewer`'s `registerHandler`
 *
 * @param name - Handler name to generate ID and tagName
 * @param mimes - List of handlers mime types
 * @param importer - Function to import the component for the handler
 * @param options - viewer's registerHandler options
 */
function registerViewerHandler(name: string, mimes: string[], importer: () => Promise<{ default: Parameters<typeof defineCustomElement>[0] }>, options: Partial<IHandler> = {}) {
	const identifier = `talk-desktop-viewer-${name}`
	registerHandler({
		id: identifier,
		// Display name is mandatory but only used in Files app menu actions
		// Using non-localized string as a stub
		displayName: 'Viewer',
		tagName: identifier,
		enabled: (nodes) => nodes.every((node) => mimes.includes(node.mime)),
		onInit: async () => {
			const { default: Component } = await importer()
			window.customElements.define(identifier, defineCustomElement(Component, { shadowRoot: false }))
		},
		...options,
		// TODO: fix upstream issue with default/light theme
		theme: 'dark',
	})
}

/**
 * Register additional viewer handlers:
 * - PDF viewer
 * - Text (.txt, .md, code) viewer
 */
export function registerViewerHandlers() {
	registerViewerHandler('pdf', ['application/pdf'], () => import('./ViewerHandlerPdf.vue'), { group: 'document' })

	registerViewerHandler('text', ['text/plain', 'text/markdown'], () => import('./ViewerHandlerText.vue'), { group: 'document' })

	registerViewerHandler(
		'code',
		[
			'application/javascript', // .js .mjs .cjs
			'application/json', // .json
			'application/x-msdos-program', // .bat .cmd
			'application/x-perl', // .pl
			'application/x-php', // .php
			'application/xml', // .xml
			'application/yaml', // .yaml .yml
			'text/css', // .css
			'text/csv', // .csv
			'text/html', // .html
			'text/x-c', // .c
			'text/x-c++src', // .cpp
			'text/x-h', // .h
			'text/x-java-source', // .java
			'text/x-ldif', // .ldif
			'text/x-python', // .py
			'text/x-rst', // .rst
			'text/x-shellscript', // .sh
		],
		() => import('./ViewerHandlerText.vue'),
		{
			group: 'code',
		},
	)
}
