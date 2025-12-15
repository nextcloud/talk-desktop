/*!
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/// <reference types="zx" />

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { resolveConfig } from '../build/resolveBuildConfig.js'
import { createReuseToml, filterReuseAnnotationsFiles, parseReuseToml } from './utils/reuse.utils.mjs'

import 'zx/globals'

const VERSION = argv._[0] ?? ''
const CONTAINER_NAME = `talk-desktop_nextcloud-server-styles-${VERSION.replaceAll('.', '_')}`
const PORT = 6123
const OUTPUT = `./resources/server-global-styles/${VERSION}`

// Use bash with WSL even on Windows to simplify docker cp usage
useBash()
$.verbose = true
$.quiet = false

if (argv.help) {
	echo`Usage: npx zx scripts/fetch-server-styles.mjs <nextcloud_tag_or_branch>

	Fetches the server styles from a Nextcloud server running in a Docker container.

	Arguments:
		<nextcloud_tag_or_branch> - the version or branch of Nextcloud Server to fetch styles from
		--help - show help
		--keep - do not stop and remove the container after fetching styles (useful for debugging)

	Example:
		npx zx ./scripts/fetch-server-styles.mjs stable32
`
	process.exit(0)
}

// Disable SSL verification to access Nextcloud server in nextcloud-easy-test container
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

if (!VERSION) {
	await echo('You must provide a version/branch as an argument.')
	process.exit(1)
}

/**
 * Whether the Nextcloud server in the container is ready
 */
async function isContainerReady() {
	try {
		const response = await fetch(`https://localhost:${PORT}/index.php`)
		return response.ok
	} catch {
		return false
	}
}

const isNotContainerReady = async () => !(await isContainerReady())

const BUILD_CONFIG = resolveConfig()

echo`Fetching server styles for ${VERSION}`
if (BUILD_CONFIG.isBranded) {
	echo`Theme: primaryColor=${BUILD_CONFIG.primaryColor}, backgroundColor=${BUILD_CONFIG.backgroundColor}, (${BUILD_CONFIG.isPlainBackground ? 'plain color' : 'image'}) background`
}

await spinner('[1/5] Preparing container...', async () => {
	const isNotRunningContainer = (await $`docker inspect -f "{{.State.Running}}" ${CONTAINER_NAME}`.nothrow().quiet()).stdout.trim() !== 'true'
	if (isNotRunningContainer) {
		await echo`Starting container...`
		await $`docker run -d -e SERVER_BRANCH=${VERSION} --name ${CONTAINER_NAME} -p ${PORT}:443 ghcr.io/szaimen/nextcloud-easy-test:latest`.run()
	}

	while (await isNotContainerReady()) {
		await sleep(1000)
	}
})

await spinner(`[2/5] Preparing output directory ${OUTPUT}`, async () => {
	await rm(OUTPUT, { recursive: true, force: true })
	await mkdir(OUTPUT)
	await mkdir(`${OUTPUT}/core`)
	await mkdir(`${OUTPUT}/core/img`)
	await mkdir(`${OUTPUT}/core/css`)
	await mkdir(`${OUTPUT}/dist`)
	await mkdir(`${OUTPUT}/apps/`)
	await mkdir(`${OUTPUT}/apps/theming/`)
	await mkdir(`${OUTPUT}/apps/theming/css`)
	await mkdir(`${OUTPUT}/apps/theming/theme`)
	await mkdir(`${OUTPUT}/apps/theming/img`)
})

await spinner('[3/5] Getting and processing styles...', async () => {
	await $`docker exec -u www-data ${CONTAINER_NAME} php /var/www/nextcloud/occ theming:config primary_color ${BUILD_CONFIG.primaryColor}`
	await $`docker exec -u www-data ${CONTAINER_NAME} php /var/www/nextcloud/occ theming:config background_color ${BUILD_CONFIG.backgroundColor}`
	if (BUILD_CONFIG.isPlainBackground) {
		await $`docker exec -u www-data ${CONTAINER_NAME} php /var/www/nextcloud/occ theming:config background backgroundColor`
	} else {
		await $`docker exec -u www-data ${CONTAINER_NAME} php /var/www/nextcloud/occ theming:config background --reset`
	}

	await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/core/img/ ${OUTPUT}/core/`
	await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/core/css/server.css ${OUTPUT}/core/css/`
	await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/dist/icons.css ${OUTPUT}/dist/`
	await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/apps/theming/img/ ${OUTPUT}/apps/theming/`
	await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/apps/theming/REUSE.toml ${OUTPUT}/apps/theming/REUSE.toml`.quiet().nothrow()

	// Fetching without cache replacing absolute /apps/theming paths with relative ones
	const fetchCssToFile = (url, output) => fetch(url, { headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } })
		.then((response) => response.text())
		.then((css) => writeFile(output, css.replaceAll('/apps/theming/', '../')))

	await fetchCssToFile(`https://localhost:${PORT}/apps/theming/css/default.css`, join(OUTPUT, '/apps/theming/css/default.css'))
	await fetchCssToFile(`https://localhost:${PORT}/index.php/apps/theming/theme/light.css?plain=0`, join(OUTPUT, '/apps/theming/theme/light.css'))
	await fetchCssToFile(`https://localhost:${PORT}/index.php/apps/theming/theme/light.css?plain=1`, join(OUTPUT, '/apps/theming/theme/light.plain.css'))
	await fetchCssToFile(`https://localhost:${PORT}/index.php/apps/theming/theme/dark.css?plain=0`, join(OUTPUT, '/apps/theming/theme/dark.css'))
	await fetchCssToFile(`https://localhost:${PORT}/index.php/apps/theming/theme/dark.css?plain=1`, join(OUTPUT, '/apps/theming/theme/dark.plain.css'))
})

await spinner('[4/5] Generating REUSE.toml ...', async () => {
	const result = await $`docker cp ${CONTAINER_NAME}:/var/www/nextcloud/REUSE.toml ${OUTPUT}/REUSE.toml`.quiet().nothrow()
	if (result.exitCode) {
		console.warn('This server version has no REUSE.toml.')
		console.warn('Skipping REUSE.toml generation...')
		return
	}

	const serverReuse = parseReuseToml(await readFile(join(OUTPUT, 'REUSE.toml'), 'utf-8'))

	const reuse = structuredClone(serverReuse)
	reuse.annotations = [
		// Fetched assets
		...filterReuseAnnotationsFiles(serverReuse.annotations, (file) => file.startsWith('core/img') || file.startsWith('apps/theming/img/')),
		// Generated files
		{
			files: [
				// Bundler generated files
				'dist/icons.css',
				// PHP generated theme files
				'apps/theming/theme/light.css',
				'apps/theming/theme/dark.css',
				'apps/theming/theme/light.plain.css',
				'apps/theming/theme/dark.plain.css',
			],
			copyright: `${new Date().getFullYear()} Nextcloud GmbH and Nextcloud contributors`,
			license: 'AGPL-3.0-or-later',
		},
	]

	await writeFile(join(OUTPUT, 'REUSE.toml'), createReuseToml(reuse), 'utf-8')
})

await spinner(`[5/5] Removing container ${argv['--keep'] ? '(SKIPPED)' : '...'}`, async () => {
	if (!argv.keep) {
		await $`docker rm --force ${CONTAINER_NAME}`
	}
})
