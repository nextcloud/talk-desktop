/*!
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/// <reference types="zx" />

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path/posix'

import 'zx/globals'

/**
 * Extract Nextcloud styles for app pages
 *
 * @param {object} options - Extraction options
 * @param {string} options.dest - Destination directory for the extracted styles
 * @param {string} options.branch - Nextcloud/server branch to extract styles from
 * @param {string} options.tag - Nextcloud/server version tag to extract styles from (overrides branch if provided)
 * @param {{name: string, primaryColor: string, backgroundColor: string}[]} options.themingConfigs - Theming configurations to extract themes with (empty name for default theme)
 * @param {boolean} options.keep - Whether to keep the Docker container after styles extraction (useful for debugging and multiple runs)
 * @param {boolean} options.verbose - Whether to show verbose output
 */
export async function extractNextcloudStyles({
	dest,
	branch = 'master',
	tag,
	themingConfigs = [{ name: '', primaryColor: '', backgroundColor: '' }],
	keep = false,
	verbose = false,
}) {
	const START = Date.now()
	const versionRef = tag || branch
	const versionRefType = tag ? 'tag' : 'branch'
	const CONTAINER = `nextcloud-app-host-styles-${versionRef.replace(/[^a-z0-9-_]/ig, '_')}`
	const THEMING_CONFIGS = themingConfigs.map((themingConfig) => ({
		...themingConfig,
		// Filename prefix
		prefix: themingConfig.name ? `${themingConfig.name}.` : '',
	}))

	// Use bash with WSL even on Windows to simplify docker cp usage
	useBash()

	$.verbose = verbose

	echo(chalk.cyan(`Extracting Nextcloud styles on ${versionRef} to ${dest} ...`))

	// --- STARTING THE SERVER --------------------------------------------------------------------------------------------

	await spinner('Starting Nextcloud server ...', async () => {
		const status = (await $`docker container inspect -f "{{.State.Status}}" ${CONTAINER}`.nothrow().quiet()).stdout.trim()
		if (!status) {
			await $`docker run -d -e SERVER_BRANCH=${versionRef} --name ${CONTAINER} ghcr.io/szaimen/nextcloud-easy-test:latest`.quiet()
		} else if (status !== 'running') {
			await $`docker start ${CONTAINER}`.quiet()
		}
		await retry(Infinity, '1s', async () => $`docker exec ${CONTAINER} curl -sk https://localhost:443/status.php`.quiet())
	})

	const { version, versionstring: versionString } = await $`docker exec ${CONTAINER} curl -sk https://localhost:443/status.php`.json()
	const versionMajor = version.split('.')[0]
	const versionCommitHash = (await $`docker exec ${CONTAINER} git -C /var/www/nextcloud rev-parse --short HEAD`.text()).trim()
	echo(chalk.yellow(`Nextcloud Server ${versionString} is ready`))

	// --- PREPARING DEST -------------------------------------------------------------------------------------------------

	const OUTPUT = join(dest, versionMajor)

	await rm(OUTPUT, { recursive: true, force: true })
	await mkdir(OUTPUT, { recursive: true })

	// Run everything in the output directory to simplify paths
	cd(OUTPUT)

	// --- COPYING STATIC FILES -------------------------------------------------------------------------------------------

	echo(chalk.cyan('· Copying static styles ...'))

	await Promise.all([
		dockerCp(CONTAINER, '/var/www/nextcloud/', 'dist/icons.css'),
		dockerCp(CONTAINER, '/var/www/nextcloud/', 'core/css/server.css'),
		dockerCp(CONTAINER, '/var/www/nextcloud/', 'core/img/filetypes/'),
		dockerCp(CONTAINER, '/var/www/nextcloud/', 'core/img/logo/'),
		dockerCp(CONTAINER, '/var/www/nextcloud/', 'apps/theming/css/default.css'),
	])

	// --- GETTING DYNAMIC THEME STYLES -----------------------------------------------------------------------------------

	echo(chalk.cyan('· Getting dynamic theming styles ...'))

	// To prevent server cache
	const v = Date.now()

	for (const { name, prefix, primaryColor, backgroundColor } of THEMING_CONFIGS) {
		echo(chalk.gray(`- Theming configuration "${name || 'default'}" (primaryColor=${primaryColor || 'default'}, backgroundColor=${backgroundColor || 'default'}) ...`))

		// Setting theming
		await $`docker exec -u www-data ${CONTAINER} php /var/www/nextcloud/occ theming:config primary_color ${primaryColor || '--reset'}`
		await $`docker exec -u www-data ${CONTAINER} php /var/www/nextcloud/occ theming:config background_color ${backgroundColor || '--reset'}`
		await $`docker exec -u www-data ${CONTAINER} php /var/www/nextcloud/occ theming:config background ${backgroundColor ? 'backgroundColor' : '--reset'}`

		// Getting the dynamic styles ...
		await mkdir('apps/theming/theme', { recursive: true })
		await Promise.all([
			// ... for [data-theme-*]
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/opendyslexic.css?plain=0&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}opendyslexic.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/light.css?plain=0&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}light.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/dark.css?plain=0&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}dark.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/light-highcontrast.css?plain=0&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}light-highcontrast.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/dark-highcontrast.css?plain=0&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}dark-highcontrast.css`),

			// ... for media queries (e.g. prefers-color-scheme, prefers-contrast)
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/light.css?plain=1&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}light.plain.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/dark.css?plain=1&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}dark.plain.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/light-highcontrast.css?plain=1&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}light-highcontrast.plain.css`),
			$`docker exec ${CONTAINER} curl -sk ${`https://localhost:443/index.php/apps/theming/theme/dark-highcontrast.css?plain=1&v=${v}`}`
				.pipe(`apps/theming/theme/${prefix}dark-highcontrast.plain.css`),
		])
	}

	// --- ASSETS EXTRACTION ----------------------------------------------------------------------------------------------

	echo(chalk.cyan('· Processing CSS ...'))
	const cssFiles = await glob('**/*.css')
	const assets = await normalizeCssAssetUrls(cssFiles)

	echo(chalk.cyan('· Extracting assets ...'))
	await Promise.all(assets.map((asset) => dockerCp(CONTAINER, '/var/www/nextcloud/', asset)))

	// --- FINALIZING -----------------------------------------------------------------------------------------------------

	echo(chalk.cyan('· Adding re-exports and REUSE.toml ...'))

	// Server REUSE.toml files include much more files that are being fetched but extra entries are allowed
	await dockerCp(CONTAINER, '/var/www/nextcloud/', 'REUSE.toml', true) // Added in Nextcloud 30
	await dockerCp(CONTAINER, '/var/www/nextcloud/', 'apps/theming/REUSE.toml', true) // Added in Nextcloud 32
	// Additional REUSE for dynamic styles
	await render('REUSE.template.toml', 'apps/theming/theme/REUSE.toml', {
		files: JSON.stringify(await glob('*.css', { cwd: 'apps/theming/theme' })),
	})

	// Re-exports entrypoints
	await render('index.template.css', 'index.css')
	await render('server.template.css', 'server.css')
	await Promise.all(THEMING_CONFIGS.map(async ({ prefix }) => {
		await render('theming.template.css', `${prefix}theming.css`, { prefix })
	}))
	await render('meta.template.js', 'meta.js', {
		versionRef,
		versionRefType,
		versionMajor,
		version,
		versionString,
		versionCommitHash,
		themingConfigs: '[' + themingConfigs.map(({ name, primaryColor, backgroundColor }) => `{ name: '${name}', primaryColor: '${primaryColor}', backgroundColor: '${backgroundColor}' }`).join(', ') + ']',
	})

	// --- STOPPING THE SERVER --------------------------------------------------------------------------------------------

	echo(chalk.cyan('· Stopping the server ...'))
	if (keep) {
		await $`docker stop ${CONTAINER}`.quiet()
	} else {
		await $`docker rm --force ${CONTAINER}`.quiet()
	}

	// --- YAY ------------------------------------------------------------------------------------------------------------

	echo(chalk.green(`✔ Finished in ${((Date.now() - START) / 1000).toFixed()}s`))
}

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Copy files from the Docker container to the host.
 * Files are copied from the host, relative to the container's cwd and placed in the host, relative to the script's cwd.
 * Directory is ensured to exist.
 *
 * @param {string} container - Docker container name
 * @param {string} containerCwd - Current working directory inside the container
 * @param {string} path - Path to the file or directory to copy
 * @param {boolean} soft - Whether to ignore errors (e.g. for non-existing files)
 */
async function dockerCp(container, containerCwd, path, soft = false) {
	const dest = dirname(path)
	await mkdir(dest, { recursive: true })
	return $`docker cp ${container}:${containerCwd}${path} ${dest}`.nothrow(soft)
}

/**
 * Write file from a template with provided replacements
 *
 * @param {string} templateName - name of the template file in the "templates" directory
 * @param {string} dist - destination path for the rendered file
 * @param {Object<string, string>} data - key-value pairs for template placeholders, {{year}} is built-in
 */
async function render(templateName, dist, data = {}) {
	const replacements = {
		year: new Date().getFullYear(),
		...data,
	}

	const templatePath = join(import.meta.dirname, 'templates', templateName)
	const template = await readFile(templatePath, 'utf-8')
	const rendered = template.replace(/\{\{(\w+)\}\}/g, (_, key) => replacements[key] || '')
	await writeFile(dist, rendered, 'utf-8')
	if ($.verbose) {
		echo(`  ${chalk.green('render')} ${dist}`)
	}
}

/**
 * RE extracting url() links from CSS
 */
const CSS_URL_REGEX = /url\(['"]?([./][^'"?]+?)(?:\?[^'"]+)?['"]?\)/g

/**
 * Normalize assets from "url()" in CSS files:
 * - Convert absolute URL paths to relatives inside the CSS files
 * - Get all the asset paths, relative to the current working directory
 *
 * @param {string[]} files - CSS file paths
 * @return {Promise<string[]>} - Unique URLs from the CSS files, relative to the CWD
 */
export async function normalizeCssAssetUrls(files) {
	const assets = await Promise.all(files.map(async (file) => {
		const normalizedPaths = []
		const css = await readFile(file, 'utf-8')
		const transformed = css.replace(CSS_URL_REGEX, (_, url) => {
			const relativePath = url.startsWith('/')
				? relative(dirname(file), relative('/', url))
				: url
			normalizedPaths.push(join(dirname(file), relativePath))
			return `url('${relativePath}')`
		})
		await writeFile(file, transformed, 'utf-8')
		return normalizedPaths
	}))

	return [...new Set(assets.flat())]
}
