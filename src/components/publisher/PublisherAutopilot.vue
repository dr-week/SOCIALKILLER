<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ExternalLink, RefreshCw, Save, Trash2, Workflow } from 'lucide-vue-next'

interface WorkflowStep {
  id: string
  action: 'click' | 'fill' | 'scroll' | 'wait'
  selector?: string
  label?: string
  value?: string
  deltaY?: number
  durationMs?: number
}

interface InteractionWorkflow {
  id: string
  brandId: string
  name: string
  origin: string
  steps: WorkflowStep[]
}

const props = defineProps<{ brandId: string }>()
const workflows = ref<InteractionWorkflow[]>([])
const selectedId = ref('')
const status = ref('')
const loading = ref(false)
const saving = ref(false)
const selected = computed(() => workflows.value.find(item => item.id === selectedId.value) || null)
const selectedHost = computed(() => selected.value ? new URL(selected.value.origin).hostname : '')

async function loadWorkflows() {
  loading.value = true
  try {
    const response = await fetch(`/api/social/workflows?brandId=${encodeURIComponent(props.brandId)}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not load workflows.')
    workflows.value = data.workflows || []
    if (!workflows.value.some(item => item.id === selectedId.value)) selectedId.value = workflows.value[0]?.id || ''
    status.value = ''
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Could not load workflows.'
  } finally { loading.value = false }
}

async function saveWorkflow() {
  if (!selected.value || !selected.value.name.trim()) return
  saving.value = true
  try {
    const response = await fetch('/api/social/workflows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected.value)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Could not save workflow.')
    Object.assign(selected.value, data.workflow)
    status.value = 'Workflow saved.'
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Could not save workflow.'
  } finally { saving.value = false }
}

async function deleteWorkflow() {
  if (!selected.value) return
  try {
    const query = new URLSearchParams({ id: selected.value.id, brandId: props.brandId })
    const response = await fetch(`/api/social/workflows?${query}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Could not delete workflow.')
    workflows.value = workflows.value.filter(item => item.id !== selectedId.value)
    selectedId.value = workflows.value[0]?.id || ''
    status.value = 'Workflow deleted.'
  } catch (error) {
    status.value = error instanceof Error ? error.message : 'Could not delete workflow.'
  }
}

watch(() => props.brandId, loadWorkflows)
onMounted(loadWorkflows)
</script>

<template>
  <section class="workflow-studio">
    <header class="studio-heading">
      <div><Workflow :size="17" /><h2>Page workflows</h2></div>
      <button class="icon-button" :disabled="loading" aria-label="Refresh workflows" @click="loadWorkflows"><RefreshCw :size="15" /></button>
    </header>

    <p class="studio-note">Record on a website with The Social Base companion. Review steps here; replay from the companion on that same site. Values you add are stored locally; avoid passwords and codes.</p>
    <p v-if="status" class="studio-status" role="status">{{ status }}</p>

    <div v-if="!workflows.length && !loading" class="workflow-empty">
      <p>No workflows saved for this company.</p>
      <span>Open a website, start recording from the extension, then stop and save.</span>
    </div>

    <div v-else-if="selected" class="workflow-editor">
      <div class="workflow-meta">
        <label>Workflow name<input v-model="selected.name" maxlength="80"></label>
        <span><ExternalLink :size="13" /> {{ selectedHost }}</span>
      </div>

      <ol class="workflow-steps">
        <li v-for="(step, index) in selected.steps" :key="step.id" class="workflow-step">
          <span class="step-index">{{ index + 1 }}</span>
          <div class="step-detail">
            <strong>{{ step.action === 'fill' ? 'Enter text' : step.action === 'click' ? 'Click control' : step.action === 'scroll' ? 'Scroll page' : 'Wait' }}</strong>
            <small v-if="step.action === 'click' || step.action === 'fill'">{{ step.label }}</small>
            <small v-else-if="step.action === 'scroll'">{{ step.deltaY }} px</small>
            <small v-else>{{ step.durationMs }} ms</small>
          </div>
          <input v-if="step.action === 'fill'" v-model="step.value" class="step-value" maxlength="2000" placeholder="Add text to enter">
        </li>
      </ol>

      <footer class="workflow-actions">
        <button class="save-button" :disabled="saving" @click="saveWorkflow"><Save :size="14" /> {{ saving ? 'Saving…' : 'Save review' }}</button>
        <button class="delete-button" @click="deleteWorkflow"><Trash2 :size="14" /> Delete</button>
      </footer>
    </div>
  </section>
</template>

<style scoped lang="scss">
.workflow-studio { display: grid; gap: 14px; }
.studio-heading { display: flex; align-items: center; justify-content: space-between; padding: 15px 17px; border: 1px solid var(--surface-border); border-radius: 10px; background: var(--surface-card); }
.studio-heading > div { display: flex; align-items: center; gap: 9px; color: var(--purple); }
.studio-heading h2 { margin: 0; color: var(--ink); font-size: 15px; }
.icon-button, .delete-button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--surface-border); border-radius: 7px; background: var(--surface-raised); color: var(--ink); cursor: pointer; }
.icon-button { width: 32px; height: 32px; justify-content: center; }
.studio-note, .studio-status { margin: 0; color: var(--muted); font-size: 12px; }
.studio-status { color: var(--purple); }
.workflow-empty, .workflow-editor { padding: 17px; border: 1px solid var(--surface-border); border-radius: 10px; background: var(--surface-card); }
.workflow-empty p { margin: 0 0 5px; color: var(--ink); font-weight: 700; }
.workflow-empty span { color: var(--muted); font-size: 12px; }
.workflow-editor { display: grid; gap: 14px; }
.workflow-meta { display: flex; align-items: end; justify-content: space-between; gap: 12px; }
.workflow-meta label { display: grid; flex: 1; gap: 6px; color: var(--muted); font-size: 11px; }
.workflow-meta input, .step-value { min-width: 0; padding: 9px 10px; border: 1px solid var(--surface-border); border-radius: 7px; background: var(--input-bg); color: var(--ink); font: inherit; }
.workflow-meta > span { display: inline-flex; align-items: center; gap: 5px; padding-bottom: 9px; color: var(--muted); font-size: 11px; }
.workflow-steps { display: grid; gap: 7px; margin: 0; padding: 0; list-style: none; }
.workflow-step { display: flex; align-items: center; gap: 10px; padding: 9px; border: 1px solid var(--surface-border); border-radius: 8px; background: var(--surface-raised); }
.step-index { display: grid; width: 23px; height: 23px; flex: 0 0 auto; place-items: center; border-radius: 7px; background: var(--purple-soft); color: var(--purple); font-size: 10px; font-weight: 700; }
.step-detail { display: grid; min-width: 100px; gap: 3px; color: var(--ink); font-size: 11px; }
.step-detail small { overflow: hidden; color: var(--muted); text-overflow: ellipsis; white-space: nowrap; }
.step-value { flex: 1; }
.workflow-actions { display: flex; justify-content: space-between; gap: 8px; }
.save-button, .delete-button { min-height: 34px; padding: 0 11px; font: inherit; font-size: 11px; font-weight: 600; }
.save-button { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 7px; background: var(--purple); color: #fff; cursor: pointer; }
.delete-button { color: #c64453; }
.save-button:disabled { opacity: .55; cursor: wait; }
@media (max-width: 600px) { .workflow-meta { align-items: stretch; flex-direction: column; }.workflow-meta > span { padding-bottom: 0; }.workflow-step { flex-wrap: wrap; }.step-value { flex-basis: calc(100% - 34px); margin-left: 33px; } }
</style>
