import { onScopeDispose, readonly, ref } from 'vue'

/**
 * Reactive matchMedia query result. Cheap version of vueuse/core/useMediaQuery
 *
 * @param query - Media query to match
 * @return - Whether the media query matches
 */
export function useMatchMedia(query: string) {
	const mediaQueryList = window.matchMedia(query)
	const matches = ref(mediaQueryList.matches)

	const onChange = () => {
		matches.value = mediaQueryList.matches
	}

	mediaQueryList.addEventListener('change', onChange)

	onScopeDispose(() => {
		mediaQueryList.removeEventListener('change', onChange)
	})

	return readonly(matches)
}
