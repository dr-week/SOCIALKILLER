<script setup lang="ts">
import UiButton from '../../shared/ui/UiButton.vue'
import UiField from '../../shared/ui/UiField.vue'
import type { AutomationCondition } from './types'

const props = defineProps<{ modelValue: AutomationCondition; index: number }>()
const emit = defineEmits<{
  (event: 'update:modelValue', value: AutomationCondition): void
  (event: 'remove'): void
}>()
const fields: AutomationCondition['field'][] = ['event.platformId', 'event.source', 'event.status', 'event.title']
const operators: AutomationCondition['operator'][] = ['equals', 'contains']
function isField(value: string): value is AutomationCondition['field'] {
  return fields.some(field => field === value)
}
function isOperator(value: string): value is AutomationCondition['operator'] {
  return operators.some(operator => operator === value)
}
function updateField(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (isField(value)) emit('update:modelValue', { ...props.modelValue, field: value })
}
function updateOperator(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (isOperator(value)) emit('update:modelValue', { ...props.modelValue, operator: value })
}
function updateValue(event: Event) {
  emit('update:modelValue', { ...props.modelValue, value: (event.target as HTMLInputElement).value })
}
</script>

<template>
  <fieldset class="automation-condition">
    <legend>Condition {{ index + 1 }}</legend>
    <UiField label="Event field" :for-id="`automation-condition-field-${index}`">
      <select :id="`automation-condition-field-${index}`" :value="modelValue.field" @change="updateField">
        <option v-for="field in fields" :key="field" :value="field">{{ field.replace('event.', '') }}</option>
      </select>
    </UiField>
    <UiField label="Match" :for-id="`automation-condition-operator-${index}`">
      <select :id="`automation-condition-operator-${index}`" :value="modelValue.operator" @change="updateOperator">
        <option value="equals">Equals</option><option value="contains">Contains</option>
      </select>
    </UiField>
    <UiField label="Value" :for-id="`automation-condition-value-${index}`">
      <input :id="`automation-condition-value-${index}`" :value="modelValue.value" maxlength="120" required @input="updateValue" />
    </UiField>
    <UiButton variant="quiet" size="small" @click="emit('remove')">Remove condition</UiButton>
  </fieldset>
</template>

<style scoped>
.automation-condition { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)) auto; align-items: end; gap: 10px; margin: 0; padding: 12px; border: 1px solid var(--line); border-radius: 14px; }.automation-condition legend { padding: 0 6px; color: var(--muted); font-size: 10px; font-weight: 700; }
@media(max-width:680px) { .automation-condition { grid-template-columns: 1fr 1fr; } }
</style>
