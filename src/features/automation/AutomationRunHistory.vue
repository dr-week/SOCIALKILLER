<script setup lang="ts">
import UiButton from '../../shared/ui/UiButton.vue'
import UiCard from '../../shared/ui/UiCard.vue'
import type { AutomationRun } from './types'

defineProps<{ runs: AutomationRun[]; busy: boolean }>()
const emit = defineEmits<{ (event: 'retry', run: AutomationRun): void }>()
</script>

<template>
  <UiCard eyebrow="OBSERVABILITY" title="Execution history" description="Runs, conditional branches, draft results, and errors are stored locally.">
    <div v-if="!runs.length" class="run-empty">Execution history will appear here.</div>
    <article v-for="run in runs" :key="run.id" class="automation-run">
      <div><strong>{{ run.status }}</strong><time>{{ new Date(run.startedAt).toLocaleString() }}</time></div>
      <p v-if="run.error" class="run-error">{{ run.error }}</p>
      <ul v-if="run.actionResults.length">
        <li v-for="result in run.actionResults" :key="`${result.branch}-${result.index}`">
          {{ result.branch }} · step {{ result.index + 1 }} · {{ result.result.title || result.result.id || 'Draft created' }}
        </li>
      </ul>
      <UiButton v-if="run.status === 'failed'" size="small" :disabled="busy" @click="emit('retry', run)">Retry failed run</UiButton>
    </article>
  </UiCard>
</template>

<style scoped>
.run-empty { padding: 18px; border: 1px dashed var(--line); border-radius: 12px; color: var(--muted); font-size: 11px; text-align: center; }.automation-run { display: grid; gap: 7px; padding: 13px 0; border-top: 1px solid var(--line); }.automation-run>div { display: flex; align-items: center; justify-content: space-between; gap: 8px; }.automation-run strong { color: var(--accent-primary); font-size: 10px; text-transform: uppercase; }.automation-run time,.automation-run li { color: var(--muted); font-size: 10px; }.automation-run p { margin: 0; }.automation-run ul { display: grid; gap: 5px; margin: 0; padding-left: 18px; }.run-error { color: var(--status-danger); font-size: 10px; line-height: 1.5; }
</style>
