/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'

/**
 * Create and mount Viewer instance with similar to original OCA.Viewer interface
 * @return {object}
 */
export async function createViewer() {
	const { default: ViewerApp } = await import('./ViewerApp.vue')
	const { default: ViewerHandlerImages } = await import('./ViewerHandlerImages.vue')
	const { default: ViewerHandlerVideos } = await import('./ViewerHandlerVideos.vue')
	const { default: ViewerHandlerPdf } = await import('./ViewerHandlerPdf.vue')
	const { default: ViewerHandlerText } = await import('./ViewerHandlerText.vue')

	const Viewer = {
		availableHandlers: [{
			id: 'images',
			group: 'media',
			mimes: [
				'image/apng',
				'image/bmp',
				'image/gif',
				'image/jpeg',
				'image/png',
				'image/svg+xml',
				'image/webp',
				'image/x-icon',
				'image/x-xbitmap',
			],
			component: ViewerHandlerImages,
		}, {
			id: 'videos',
			group: 'media',
			mimes: [
				'video/mpeg',
				'video/ogg',
				'video/webm',
				'video/mp4',
				'video/x-m4v',
				'video/x-flv',
				'video/quicktime',
				'video/x-matroska',
			],
			component: ViewerHandlerVideos,
		}, {
			id: 'pdf',
			group: 'document',
			mimes: ['application/pdf'],
			component: ViewerHandlerPdf,
		}, {
			id: 'text',
			group: 'document',
			mimes: [
				'text/markdown',
				'text/plain',
			],
			component: ViewerHandlerText,
		}, {
			id: 'text',
			group: 'code',
			mimes: [
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
			component: ViewerHandlerText,
		}],

		open(...args) {
			Viewer.instance.open(...args)
		},

		close() {
			Viewer.instance.close()
		},

		instance: null,
	}

	const container = document.body.appendChild(document.createElement('div'))
	Viewer.instance = new Vue(ViewerApp).$mount(container)

	return Viewer
}
