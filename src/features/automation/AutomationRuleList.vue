<script setup lang="ts">
import UiButton from '../../shared/ui/UiButton.vue'
import UiCard from '../../shared/ui/UiCard.vue'
import type { AutomationRule } from './types'

defineProps<{ rules: AutomationRule[]; busy: boolean }>()
const emit = defineEmits<{
  (event: 'toggle', rule: AutomationRule): void
  (event: 'run', rule: AutomationRule): void
  (event: 'remove', rule: AutomationRule): void
}>()
const triggerLabel = (rule: AutomationRule) => rule.triggerType === 'social.post.created'
  ? 'When a social post is created'
  : rule.triggerType === 'schedule' ? `Every ${rule.triggerConfig.intervalMinutes} minutes` : 'Manual'
</script>

<template>
  <UiCard eyebrow="WORKFLOWS" title="Saved automations" :description="`${rules.length} rule${rules.length === 1 ? '' : 's'} for this brand.`">
    <div v-if="!rules.length" class="automation-empty">No workflows yet. Create a draft-safe workflow to get started.</div>
    <article v-for="rule in rules" :key="rule.id" class="automation-rule">
      <div class="automation-rule__heading"><strong>{{ rule.name }}</strong><span :class="{ 'is-enabled': rule.enabled }">{{ rule.enabled ? 'Active' : 'Paused' }}</span></div>
      <p>{{ triggerLabel(rule) }} · {{ rule.conditions.length }} condition{{ rule.conditions.length === 1 ? '' : 's' }} · {{ rule.actions.length + rule.elseActions.length }} draft step{{ rule.actions.length + rule.elseActions.length === 1 ? '' : 's' }}</p>
      <small v-if="rule.lastRunAt">Last run {{ new Date(rule.lastRunAt).toLocaleString() }}</small>
      <div class="automation-rule__actions">
        <UiButton size="small" :disabled="busy" @click="emit('toggle', rule)">{{ rule.enabled ? 'Pause' : 'Activate' }}</UiButton>
        <UiButton size="small" variant="primary" :disabled="busy || !rule.enabled" @click="emit('run', rule)">Run now</UiButton>
        <UiButton size="small" variant="quiet" :disabled="busy" @click="emit('remove', rule)">Delete</UiButton>
      </div>
    </article>
  </UiCard>
</template>

<style scoped>
.automation-empty { padding: 18px; border: 1px dashed var(--line); border-radius: 12px; color: var(--muted); font-size: 11px; line-height: 1.6; text-align: center; }
.automation-rule { display: grid; gap: 7px; padding: 14px 0; border-top: 1px solid var(--line); }.automation-rule__heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.automation-rule__heading strong { font-size: 12px; }.automation-rule__heading span { color: var(--muted); font-size: 9px; }.automation-rule__heading span.is-enabled { color: var(--status-success); }.automation-rule p,.automation-rule small { margin: 0; color: var(--muted); font-size: 10px; line-height: 1.5; }.automation-rule__actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 4px; }
</style>
