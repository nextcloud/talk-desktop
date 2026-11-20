<!--
	- SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
	- SPDX-License-Identifier: AGPL-3.0-or-later
	-->

<script setup lang="ts">
import { nextTick } from 'vue'
import { getLanguage, t } from '@nextcloud/l10n'
import { computed, ref, useTemplateRef } from 'vue'
import NcFormBox from '@nextcloud/vue/components/NcFormBox'
import NcFormBoxButton from '@nextcloud/vue/components/NcFormBoxButton'
import NcFormBoxSwitch from '@nextcloud/vue/components/NcFormBoxSwitch'
import NcFormGroup from '@nextcloud/vue/components/NcFormGroup'
import NcSelect from '@nextcloud/vue/components/NcSelect'
import IconPencilOutline from 'vue-material-design-icons/PencilOutline.vue'
import { useAppConfigValue } from '../useAppConfigValue.ts'

// macOS uses the system-wide spell checker
const hasSpellCheckLanguagesSupport = !window.systemInfo.isMac

const enableSpellCheck = useAppConfigValue('enableSpellCheck')
const spellCheckLanguages = useAppConfigValue('spellCheckLanguages')

const isLanguagesSelectOpen = ref(false)

const availableSpellCheckLanguages = ref<{ label: string, value: string }[]>([])

const localeNames = new Intl.DisplayNames([getLanguage()], { type: 'language' })
const langToSelectOption = (code: string) => ({ label: localeNames.of(code) ?? code, value: code })

window.TALK_DESKTOP.getAvailableSpellCheckerLanguages().then((languages: string[]) => {
	availableSpellCheckLanguages.value = languages.map((code) => code.replaceAll('_', '-')).map(langToSelectOption)
})

const selectedSpellCheckLanguagesOption = computed({
	get: () => spellCheckLanguages.value.map(langToSelectOption),
	set(value) {
		spellCheckLanguages.value = value.map((option) => option.value)
	},
})

const listFormatter = new Intl.ListFormat(getLanguage(), { type: 'unit' })
const selectedLanguages = computed(() => spellCheckLanguages.value.length
	? listFormatter.format(selectedSpellCheckLanguagesOption.value.map(({ label }) => label))
	: t('talk_desktop', 'System default'))

const selectRef = useTemplateRef('select')
const buttonRef = useTemplateRef('button')

/**
 * Toggle the select
 *
 * @param toSelect Toggle to select (true) or back (false)
 */
async function toggleSelect(toSelect: boolean) {
	if (toSelect) {
		isLanguagesSelectOpen.value = true
		await nextTick()
		console.log(selectRef.value)
		selectRef.value!.$el.querySelector('input')!.focus()
		selectRef.value!.$el.querySelector('input')!.click()
	} else {
		isLanguagesSelectOpen.value = false
		await nextTick()
		buttonRef.value!.$el.querySelector('button')!.focus()
	}
}
</script>

<template>
	<NcFormGroup :label="t('talk_desktop', 'Spell checking')">
		<NcFormBox>
			<NcFormBoxSwitch v-model="enableSpellCheck" :label="t('talk_desktop', 'Spell checking')" />
			<template v-if="hasSpellCheckLanguagesSupport && enableSpellCheck">
				<NcFormBoxButton
					v-if="!isLanguagesSelectOpen"
					ref="button"
					:label="t('talk_desktop', 'Spell checking languages')"
					:description="selectedLanguages"
					:disabled="!enableSpellCheck"
					invertedAccent
					@click="toggleSelect(true)">
					<template #icon>
						<IconPencilOutline :size="20" />
					</template>
				</NcFormBoxButton>
				<NcSelect
					v-else
					ref="select"
					v-model="selectedSpellCheckLanguagesOption"
					class="spell-checking-languages"
					:inputLabel="t('talk_desktop', 'Spell checking languages')"
					:options="availableSpellCheckLanguages"
					multiple
					keepOpen
					@close="toggleSelect(false)" />
			</template>
		</NcFormBox>
	</NcFormGroup>
</template>

<style scoped>
.spell-checking-languages :deep(.select__label) {
}
</style>
