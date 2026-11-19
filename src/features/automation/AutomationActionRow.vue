<script setup lang="ts">
import UiButton from '../../shared/ui/UiButton.vue'
import UiField from '../../shared/ui/UiField.vue'
import type { AutomationAction } from './types'

const props = defineProps<{ modelValue: AutomationAction; index: number; label: string }>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: AutomationAction): void
  (event: 'remove'): void
}>()
const platforms = ['x', 'instagram', 'linkedin', 'reddit', 'github', 'discord', 'devto', 'hashnode', 'medium', 'ai_registry']
function update<K extends keyof AutomationAction>(field: K, value: AutomationAction[K]) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
function updatePlatforms(event: Event) {
  const select = event.target as HTMLSelectElement
  update('platformIds', Array.from(select.selectedOptions, option => option.value))
}
</script>

<template>
  <fieldset class="automation-action">
    <legend>{{ label }} · draft step {{ index + 1 }}</legend>
    <UiField :label="`Step ${index + 1} topic`" :for-id="`automation-topic-${label}-${index}`">
      <input :id="`automation-topic-${label}-${index}`" :value="modelValue.topic" maxlength="160" required @input="update('topic', ($event.target as HTMLInputElement).value)" />
    </UiField>
    <UiField :label="`Step ${index + 1} notes`" :for-id="`automation-notes-${label}-${index}`" hint="Creates an editable social draft; it never publishes automatically.">
      <textarea :id="`automation-notes-${label}-${index}`" :value="modelValue.notes" maxlength="3000" rows="2" @input="update('notes', ($event.target as HTMLTextAreaElement).value)" />
    </UiField>
    <UiField :label="`Step ${index + 1} channels`" :for-id="`automation-platforms-${label}-${index}`" hint="Select up to five.">
      <select :id="`automation-platforms-${label}-${index}`" multiple :value="modelValue.platformIds" @change="updatePlatforms">
        <option v-for="platform in platforms" :key="platform" :value="platform">{{ platform }}</option>
      </select>
    </UiField>
    <UiButton v-if="index > 0" variant="quiet" size="small" @click="emit('remove')">Remove step</UiButton>
  </fieldset>
</template>

<style scoped>
.automation-action { display: grid; gap: 12px; min-width: 0; margin: 0; padding: 14px; border: 1px solid var(--line); border-radius: 14px; }.automation-action legend { padding: 0 6px; color: var(--purple); font-size: 10px; font-weight: 700; }
.automation-action textarea { resize: vertical; }.automation-action select { min-height: 78px!important; }
</style>
