<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Activity, ExternalLink, Layers, RefreshCw, Save, ScanEye, Trash2 } from 'lucide-vue-next'

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
    <div class="studio-bar">
      <div class="bot-layers" title="3-Layer Visual Bot Engine">
        <span class="layer-chip" title="Layer 1: Semantic DOM"><Layers :size="12" /><span>DOM</span></span>
        <span class="layer-chip" title="Layer 2: Sobel + 2D NCC Contour"><ScanEye :size="12" /><span>Contour</span></span>
        <span class="layer-chip" title="Layer 3: Box-Muller Human Cadence"><Activity :size="12" /><span>Cadence</span></span>
      </div>
      <div class="bar-controls">
        <select v-if="workflows.length > 1" v-model="selectedId" class="wf-select" aria-label="Select workflow">
          <option v-for="wf in workflows" :key="wf.id" :value="wf.id">{{ wf.name }}</option>
        </select>
        <button class="icon-button" :disabled="loading" title="Refresh workflows" aria-label="Refresh workflows" @click="loadWorkflows">
          <RefreshCw :size="13" />
        </button>
      </div>
    </div>
    <p v-if="status" class="studio-status" role="status">{{ status }}</p>

    <div v-if="!workflows.length && !loading" class="workflow-empty">
      <p>No workflows recorded yet.</p>
      <span>Record steps from the browser companion extension.</span>
    </div>

    <div v-else-if="selected" class="workflow-editor">
      <div class="workflow-meta">
        <label>Workflow name<input v-model="selected.name" maxlength="80"></label>
        <span><ExternalLink :size="13" /> {{ selectedHost }}</span>
      </div>

      <ol v-auto-animate class="workflow-steps">
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

<style scoped lang="scss" src="./styles/publisher-autopilot.scss"></style>
