/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { join } from 'node:path'
import { writeFile, rm, mkdir, readFile } from 'node:fs/promises'
import 'zx/globals'

const VERSION = argv._[0] ?? ''
const CONTAINER_NAME = `talk-desktop_nextcloud-server-styles-${VERSION.replaceAll('.', '_')}`
const PORT = 6123
const OUTPUT = `./resources/server-global-styles/${VERSION}`

// Use bash with WSL even on Windows to simplify docker cp usage
useBash()
$.verbose = true
$.quiet = false

// Disable SSL verification to access Nextcloud server in nextcloud-easy-test container
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

if (!VERSION) {
	await echo('You must provide a version/branch as an argument.')
	process.exit(1)
}

const isNotRunningContainer = async () => (await $`docker inspect -f "{{.State.Running}}" ${CONTAINER_NAME}`.nothrow().quiet()).stdout.trim() !== 'true'

const isContainerReady = async () => {
	try {
		const response = await fetch(`https://localhost:${PORT}/index.php`)
		return response.ok
	} catch(e) {
		return false
	}
}

const isNotContainerReady = async () => !(await isContainerReady())

const cleanUpDir = async () => {
	await rm(OUTPUT, { recursive: true, force: true })
}

const filterDep5 = (dep5) => dep5
	// Split dep5 file into parts "Files:, License:, Copyright:"
	.split(/\n{2,}/m)
	// Rebuild to filter out non-needed files
	.map(part => {
		const lines = part.split('\n')
		const filesLine = lines.find(line => line.startsWith('Files: '))
		// Not files block - keep as it is
		if (!filesLine) {
			return part
		}
		const files = filesLine.slice('Files: '.length).split(/\s+/)
		const styleFiles = files?.filter(file => ['core/img', 'dist/icons.css'].includes(file) || file.startsWith('apps/theming/img/'))
		return styleFiles?.length
			? [
				`Files: ${styleFiles.join(' ')}`,
				...lines.slice(1),
			].join('\n')
			: ''
	})
	// Filter out non-needed parts
	.filter(Boolean)
	// Join parts back
	.join('\n\n')

await spinner('[1/4] Preparing container...', async () => {
	if (await isNotRunningContainer()) {
		// await echo('Starting container...')
		await $`docker run -d -e SERVER_BRANCH=${VERSION} --name ${CONTAINER_NAME} -p ${PORT}:443 ghcr.io/szaimen/nextcloud-easy-test:latest`.run()
	}

	while (await isNotRunningContainer()) {
		await sleep(1000)
	}

	while (await isNotContainerReady()) {
		await sleep(1000)
	}
})

await spinner(`[2/4] Preparing output directory ${OUTPUT}`, async () => {
	await cleanUpDir()
	await mkdir(OUTPUT)
	await mkdir(`${OUTPUT}/core`)
	await mkdir(`${OUTPUT}/core/img`)
	await mkdir(`${OUTPUT}/core/css`)
	await mkdir(`${OUTPUT}/dist`)
	await mkdir(`${OUTPUT}/apps/theming/`, { recursive: true })
	await mkdir(`${OUTPUT}/apps/theming/css`)
	await mkdir(`${OUTPUT}/apps/theming/theme`)
	await mkdir(`${OUTPUT}/apps/theming/img`)
	await mkdir(`${OUTPUT}/.reuse`)
})

await spinner('[3/4] Copying styles...', async () => {
	try {
		await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/core/img/ ${OUTPUT}/core/`
		await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/core/css/server.css ${OUTPUT}/core/css/`
		await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/dist/icons.css ${OUTPUT}/dist/`
		await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/apps/theming/img/ ${OUTPUT}/apps/theming/`
		await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/.reuse/dep5 ${OUTPUT}/.reuse/dep5`

		const defaultCSS = await fetch(`https://localhost:${PORT}/apps/theming/css/default.css`).then((response) => response.text())
		const lightCSS = await fetch(`https://localhost:${PORT}/apps/theming/theme/light.css`).then((response) => response.text())
		const darkCSS = await fetch(`https://localhost:${PORT}/apps/theming/theme/dark.css`).then((response) => response.text())

		const fixThemePaths = (css) => css.replaceAll('/apps/theming/', '../')
		await writeFile(join(OUTPUT, '/apps/theming/css/default.css'), fixThemePaths(defaultCSS))
		await writeFile(join(OUTPUT, '/apps/theming/theme/light.css'), fixThemePaths(lightCSS))
		await writeFile(join(OUTPUT, '/apps/theming/theme/dark.css'), fixThemePaths(darkCSS))

		const dep5 = await readFile(join(OUTPUT, '/.reuse/dep5'), 'utf-8')
		await writeFile(join(OUTPUT, '/.reuse/dep5_2'), filterDep5(dep5), 'utf-8')
	} catch (e) {
		await echo('Something went wrong:', e.stderr ?? e)
		await cleanUpDir()
	}
})

await spinner('[4/4] Removing container...', async () => {
	await $`docker rm --force ${CONTAINER_NAME}`
})
