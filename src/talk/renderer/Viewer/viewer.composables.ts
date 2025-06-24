/*
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { MaybeRefOrGetter, Ref } from 'vue'

import { ref, toValue, watchEffect } from 'vue'
import { fetchFileContent } from './viewer.service.ts'

type FileContentComposableResult<T> = {
	content: Ref<T>
	loading: Ref<boolean>
	error: Ref<boolean | string>
}

export function useFileContent(filename: MaybeRefOrGetter<string>, format: 'binary'): FileContentComposableResult<Blob | null>
export function useFileContent(filename: MaybeRefOrGetter<string>, format: 'text'): FileContentComposableResult<string | null>
/**
 * Fetch file content with reactive state in a watch effect
 *
 * @param filename - Path to user's file, e.g. '/Talk/file.txt'
 * @param format - Format of the file content to be returned. Binary is returned as Blob
 */
export function useFileContent(filename: MaybeRefOrGetter<string>, format: 'text' | 'binary'): FileContentComposableResult<Blob | string | null> {
	const content: Ref<Blob | string | null> = ref(null)
	const loading: Ref<boolean> = ref(false)
	const error: Ref<boolean | string> = ref(false)

	watchEffect(async () => {
		loading.value = true
		content.value = null
		error.value = false
		try {
			// Help TS to infer the type from overloads
			content.value = format === 'text'
				? await fetchFileContent(toValue(filename), format)
				: await fetchFileContent(toValue(filename), format)
		} catch (e) {
			console.error('Failed to fetch file content', e)
			// TODO: We can parse error from e.response, but it is not translated
			// Or we can add messages for different status codes but it seems
			// that it's always 404 if file cannot be loaded for any reason
			error.value = true
		}
		loading.value = false
	})

	return {
		content,
		loading,
		error,
	}
}
