<!--
  - SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
  - SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script setup lang="ts">
import { mdiArrowLeft, mdiOpenInNew, mdiWeb } from '@mdi/js'
import { t } from '@nextcloud/l10n'
import { refDebounced, useEventListener } from '@vueuse/core'
import { onBeforeUnmount, ref } from 'vue'
import NcButton from '@nextcloud/vue/components/NcButton'
import NcIconSvgWrapper from '@nextcloud/vue/components/NcIconSvgWrapper'
import NcLoadingIcon from '@nextcloud/vue/components/NcLoadingIcon'
import ButtonCopy from '../../shared/components/ButtonCopy.vue'

defineProps<{
	loginUrl: string
}>()

const {
	loginFlowV2Open,
	loginFlowV2Refresh,
	loginFlowV2Abort,
	loginFlowV2OnPollingChange,
} = window.TALK_DESKTOP

const isPolling = ref(false)
const isPollingDebounced = refDebounced(isPolling, 150)
const unsubscribe = loginFlowV2OnPollingChange((value: boolean) => {
	isPolling.value = value
})
onBeforeUnmount(() => {
	unsubscribe()
})

loginFlowV2Open()

// User likely returns to the window once the login in the browser has just been completed
// Check immediately without waiting for interval
useEventListener(window, 'focus', loginFlowV2Refresh)
</script>

<template>
	<dialog
		class="waiting-dialog"
		aria-labelledby="waiting-dialog-header"
		aria-describedby="waiting-dialog-description"
		closedby="closerequest"
		open
		@close="loginFlowV2Abort">
		<div class="waiting-dialog__content">
			<div class="waiting-dialog__heading">
				<NcIconSvgWrapper :path="mdiOpenInNew" :size="32" />
				<h2 id="waiting-dialog-header" class="waiting-dialog__header">
					{{ t('talk_desktop', 'Logging in …') }}
				</h2>
				<div id="waiting-dialog-description" class="waiting-dialog__subtext">
					{{ t('talk_desktop', 'The browser window will ask to log in and grant access') }}
				</div>
			</div>

			<div class="waiting-dialog__waiting">
				<NcLoadingIcon :size="15" />
				<span>
					{{ isPollingDebounced ? t('talk_desktop', 'Confirming authorization …') : t('talk_desktop', 'Waiting for authorization …') }}
				</span>
			</div>

			<div class="waiting-dialog__actions">
				<NcButton @click="loginFlowV2Open">
					<template #icon>
						<NcIconSvgWrapper :path="mdiWeb" :size="20" />
					</template>
					{{ t('talk_desktop', 'Open in browser') }}
				</NcButton>
				<ButtonCopy :text="t('talk_desktop', 'Copy link')" :content="loginUrl" />
			</div>
			<!-- Return button on user's demand -->
			<!-- <NcButton variant="tertiary" :disabled="status === 'polling'" @click="confirmLoginFlowV2Status">
				{{ t('talk_desktop', 'Confirm authorization') }}
			</NcButton> -->
		</div>

		<div class="waiting-dialog__footer">
			<NcButton variant="tertiary" @click="loginFlowV2Abort">
				<template #icon>
					<NcIconSvgWrapper :path="mdiArrowLeft" :size="20" directional />
				</template>
				{{ t('talk_desktop', 'Cancel') }}
			</NcButton>
		</div>
	</dialog>
</template>

<style scoped>
.waiting-dialog {
	position: fixed;
	inset-inline: 0;
	inset-block: var(--header-height) 0;
	background-color: var(--color-main-background);
	display: flex;
	flex-direction: column;
	align-items: stretch;
	width: auto;
	height: auto;
	max-height: 100%;
	-webkit-app-region: no-drag;
}

.waiting-dialog__content {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: calc(var(--default-grid-baseline) * 8);
	gap: calc(var(--default-grid-baseline) * 8);
	overflow-y: auto;
}

.waiting-dialog__heading {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 2);
}

.waiting-dialog__header {
	margin: 0;
}

.waiting-dialog__subtext {
	color: var(--color-text-maxcontrast);
}

.waiting-dialog__waiting {
	display: flex;
	align-items: center;
	gap: calc(var(--default-grid-baseline) * 1);
	color: var(--color-text-maxcontrast);
}

.waiting-dialog__actions {
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: calc(var(--default-grid-baseline) * 2);
}

.waiting-dialog__footer {
	background-color: var(--color-background-dark);
	display: flex;
	padding: calc(var(--default-grid-baseline) * 4);
}
</style>
