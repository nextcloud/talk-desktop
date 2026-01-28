<script setup>
import { ref } from 'vue'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import NcFormBoxButton from '@nextcloud/vue/components/NcFormBoxButton'
import NcFormBoxCopyButton from '@nextcloud/vue/components/NcFormBoxCopyButton'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import IconConsole from 'vue-material-design-icons/Console.vue'
import { BUILD_CONFIG } from '../../../../shared/build.config.ts'

const isFlatpak = window.systemInfo.isFlatpak
const linuxAppId = BUILD_CONFIG.linuxAppId

const loadingCleanFlatpakFontConfigCache = ref(false)

/**
 * Cleans the Flatpak font config cache
 */
async function onCleanFlatpakFontConfigCache() {
	loadingCleanFlatpakFontConfigCache.value = true
	const error = await window.TALK_DESKTOP.cleanFlatpakFontConfigCache()
	if (error) {
		loadingCleanFlatpakFontConfigCache.value = false
		// Error is not supposed to happen...
		// Using alert for an unexpected error in an advanced feature for simplicity
		alert(error)
		return
	}
	window.TALK_DESKTOP.relaunch()
}
</script>

<template>
	<NcFormBox v-if="isFlatpak">
		<NcFormBoxButton
			label="Clean Flatpak font config cache and relaunch the app"
			description="Might help with font or emoji rendering issues"
			:disabled="loadingCleanFlatpakFontConfigCache"
			@click="onCleanFlatpakFontConfigCache">
			<template #icon>
				<NcLoadingIcon v-if="loadingCleanFlatpakFontConfigCache" :size="20" />
				<IconConsole v-else :size="20" />
			</template>
		</NcFormBoxButton>
		<NcFormBoxCopyButton
			label="Copy the command to clean the font config cache manually"
			:value="`rm -rf ~/.var/app/${linuxAppId}/cache/fontconfig/`" />
	</NcFormBox>
</template>
