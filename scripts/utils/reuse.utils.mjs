/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * @typedef ReuseProlog
 * @property {string} name
 * @property {string} supplier
 * @property {string} downloadLocation
 */

/**
 * @typedef ReuseAnnotation
 * @property {string[]} files
 * @property {string} copyright
 * @property {string} license
 */

/**
 * @typedef Reuse
 * @property {ReuseProlog} prolog
 * @property {ReuseAnnotation[]} annotations
 */

/**
 * Parse .dep5 content into Reuse object
 *
 * @param {string} dep5 - .dep5 file content
 * @return {Reuse} - Parsed Reuse object
 */
export function parseDep5(dep5) {
	const [prolog, ...annotations] = dep5.split(/\n{2,}/m)
	return {
		prolog: parseDep5Prolog(prolog),
		annotations: annotations.map((annotation) => parseDep5Annotation(annotation)),
	}
}

/**
 * Parse dep5 prolog content
 *
 * @param {string} prologContent - .dep5 prolog strong content
 * @return {ReuseProlog} - Parsed prolog
 */
function parseDep5Prolog(prologContent) {
	const tags = prologContent.split('\n')
	const nameTag = tags.find((line) => line.startsWith('Upstream-Name: '))
	const supplierTag = tags.find((line) => line.startsWith('Upstream-Contact: '))
	const downloadLocationTag = tags.find((line) => line.startsWith('Source: '))

	return {
		name: nameTag.slice('Upstream-Name: '.length),
		supplier: supplierTag.slice('Upstream-Contact: '.length),
		downloadLocation: downloadLocationTag.slice('Source: '.length),
	}
}

// /**
//  *
//  * @param {string} prologContent - .dep5 prolog strong content
//  * @return {ReuseProlog} - Parsed prolog
//  */
// function parseReuseTomlProlog(prologContent) {
// 	const tags = prologContent.split('\n')
// 	const nameTag = tags.find((line) => line.startsWith('Upstream-Name: '))
// 	const supplierTag = tags.find((line) => line.startsWith('Upstream-Contact: '))
// 	const downloadLocationTag = tags.find((line) => line.startsWith('Source: '))
//
// 	return {
// 		name: nameTag.slice('Upstream-Name: '.length),
// 		supplier: supplierTag.slice('Upstream-Contact: '.length),
// 		downloadLocation: downloadLocationTag.slice('Source: '.length),
// 	}
// }

/**
 * Parse dep5 annotation content
 *
 * @param {string} annotationContent - Annotation content
 * @return {ReuseAnnotation} - Parsed annotation
 */
function parseDep5Annotation(annotationContent) {
	const tags = annotationContent.split('\n')

	const filesTag = tags.find((line) => line.startsWith('Files: '))
	const copyrightTag = tags.find((line) => line.startsWith('Copyright: '))
	const licenseTag = tags.find((line) => line.startsWith('License: '))

	return {
		files: filesTag.slice('Files: '.length).split(/\s+/),
		copyright: copyrightTag.slice('Copyright: '.length),
		license: licenseTag.slice('License: '.length),
	}
}

/**
 * Parse a single object block in .toml
 *
 * @param {string} block - Content of a single block
 * @return {object} Parsed object
 */
function parseTomlBlock(block) {
	const lines = block.split('\n')
	if (lines[0].startsWith('[[')) {
		lines.shift()
	}
	const object = {}
	for (const line of lines) {
		const [isMatched, key, value] = line.match(/^(.*?)\s*=\s*(.*)/) ?? []
		if (!isMatched) {
			console.warn('Unknown line format in toml:')
			console.warn(line)
			throw new Error(`Failed to parse toml: "${line}"`)
		}
		object[key] = JSON.parse(value)
	}
	return object
}

/**
 * Parse REUSE.toml content to array of objects
 *
 * @param content
 */
export function parseReuseToml(content) {
	const blocks
		= content
			// Remove comments
			.split('\n')
			.filter((line) => !line.startsWith('#'))
			.join('\n')
			// Remove double empty lines
			.replaceAll(/\n{2,}/gm, '\n\n')
			// Split into blocks
			.split(/\n{2,}/m)
			// Trim
			.map((block) => block.trim())

	const prologRaw = blocks[0]
	const annotationsRaw = blocks.slice(1)

	if (prologRaw.startsWith('[[')) {
		console.error('Unexpected prolog: ', prologRaw)
		throw new Error('Failed to parse reuse')
	}

	const prologParsed = parseTomlBlock(prologRaw)
	/** @type {ReuseProlog} */
	const prolog = {
		name: prologParsed['SPDX-PackageName'],
		supplier: prologParsed['SPDX-PackageSupplier'],
		downloadLocation: prologParsed['SPDX-PackageDownloadLocation'],
	}

	const wrongAnnotation = annotationsRaw.find((block) => !block.startsWith('[[annotations]]'))
	if (wrongAnnotation) {
		console.error('Unknown block in REUSE.toml:')
		console.error(wrongAnnotation)
		throw new Error('Failed to parse reuse.')
	}

	const annotations = annotationsRaw.map((annotation) => parseTomlBlock(annotation)).map((annotation) => ({
		files: !Array.isArray(annotation.path) ? [annotation.path] : annotation.path,
		copyright: annotation['SPDX-FileCopyrightText'],
		license: annotation['SPDX-License-Identifier'],
	}))

	return {
		prolog,
		annotations,
	}
}

/**
 * Convert Reuse Prolog object to REUSE.toml prolog content
 *
 * @param {ReuseProlog} prolog - Reuse prolog object
 * @return {string} - REUSE.toml prolog content
 */
function convertReusePrologToReuseToml(prolog) {
	return `version = 1
SPDX-PackageName = "${prolog.name}"
SPDX-PackageSupplier = "${prolog.supplier}"
SPDX-PackageDownloadLocation = "${prolog.downloadLocation}"`
}

/**
 * Convert Reuse Annotation object to REUSE.toml annotation content
 *
 * @param {ReuseAnnotation} annotation - Reuse annotation object
 * @return {string} - REUSE.toml annotation content
 */
function convertReuseAnnotationToReuseToml(annotation) {
	const { files } = annotation
	return `[[annotations]]
path = ${JSON.stringify(files.length === 1 ? files[0] : files)}
precedence = "aggregate"
SPDX-FileCopyrightText = "${annotation.copyright}"
SPDX-License-Identifier = "${annotation.license}"`
}

/**
 * Generate REUSE.toml file content from reuse blocks
 *
 * @param {Reuse} reuse - Reuse object
 * @return {string} - REUSE.toml file content
 */
export function createReuseToml(reuse) {
	return convertReusePrologToReuseToml(reuse.prolog)
		+ '\n\n'
		+ reuse.annotations.map(convertReuseAnnotationToReuseToml).join('\n\n')
		+ '\n'
}

/**
 * Filter reuse annotations by files
 *
 * @param {ReuseAnnotation[]} annotations - Reuse annotations to filter
 * @param {(files: string) => boolean} filter - Function to filter files
 * @return {ReuseAnnotation[]}
 */
export function filterReuseAnnotationsFiles(annotations, filter) {
	return annotations.map((annotation) => ({
		...annotation,
		files: annotation.files.filter((file) => filter(file)),
	})).filter((annotation) => annotation.files.length)
}
