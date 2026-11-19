<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import UiButton from '../../shared/ui/UiButton.vue'
import UiCard from '../../shared/ui/UiCard.vue'
import UiField from '../../shared/ui/UiField.vue'
import AutomationActionRow from './AutomationActionRow.vue'
import AutomationConditionRow from './AutomationConditionRow.vue'
import AutomationRuleList from './AutomationRuleList.vue'
import AutomationRunHistory from './AutomationRunHistory.vue'
import type { AutomationAction, AutomationCondition, AutomationRule, AutomationRun, AutomationTrigger } from './types'

const props = defineProps<{ brandId: string; brandName: string }>()
const rules = ref<AutomationRule[]>([])
const runs = ref<AutomationRun[]>([])
const busy = ref(false)
const message = ref('')
const error = ref('')
const form = reactive({
  name: '', triggerType: 'manual' as AutomationTrigger, intervalMinutes: 60,
  conditions: [] as AutomationCondition[],
  actions: [{ type: 'create_social_draft', topic: '', notes: '', platformIds: ['x'] }] as AutomationAction[],
  elseActions: [] as AutomationAction[]
})
const canAddStep = computed(() => form.actions.length < 5)

async function request<T>(url: string, method = 'GET', body?: object): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`)
  return data as T
}

async function refresh() {
  const data = await request<{ rules: AutomationRule[]; runs: AutomationRun[] }>(`/api/automations?brandId=${encodeURIComponent(props.brandId)}`)
  rules.value = data.rules
  runs.value = data.runs
}

async function perform(action: () => Promise<void>) {
  busy.value = true
  error.value = ''
  message.value = ''
  try { await action(); await refresh() } catch (reason) {
    error.value = reason instanceof Error ? reason.message : 'Automation request failed.'
  } finally { busy.value = false }
}

function newAction(): AutomationAction {
  return { type: 'create_social_draft', topic: '', notes: '', platformIds: ['x'] }
}

function addCondition() {
  if (form.conditions.length < 5) form.conditions.push({ field: 'event.platformId', operator: 'equals', value: '' })
}

function addAction(branch: 'actions' | 'elseActions') {
  if (form[branch].length < 5) form[branch].push(newAction())
}

async function create() {
  await perform(async () => {
    const data = await request<{ rule: AutomationRule }>('/api/automations', 'POST', {
      brandId: props.brandId, name: form.name, triggerType: form.triggerType,
      triggerConfig: form.triggerType === 'schedule' ? { intervalMinutes: Number(form.intervalMinutes) } : {},
      conditions: form.conditions, actions: form.actions, elseActions: form.elseActions
    })
    rules.value.unshift(data.rule)
    form.name = ''
    message.value = 'Workflow saved paused. Activate it when ready.'
  })
}

function toggle(rule: AutomationRule) {
  return perform(async () => { await request(`/api/automations/${rule.id}`, 'PATCH', { brandId: props.brandId, enabled: !rule.enabled }) })
}
function run(rule: AutomationRule) {
  return perform(async () => {
    await request(`/api/automations/${rule.id}/run`, 'POST', { brandId: props.brandId })
    message.value = 'Workflow run recorded. Any created content remains an editable draft.'
  })
}
function remove(rule: AutomationRule) {
  return perform(async () => { await request(`/api/automations/${rule.id}?brandId=${encodeURIComponent(props.brandId)}`, 'DELETE') })
}
function retry(runRecord: AutomationRun) {
  return perform(async () => { await request(`/api/automations/runs/${runRecord.id}/retry`, 'POST', { brandId: props.brandId }) })
}

onMounted(() => { void refresh().catch(reason => { error.value = reason instanceof Error ? reason.message : 'Unable to load automation data.' }) })
</script>

<template>
  <main class="automation-studio">
    <header class="automation-studio__hero">
      <p>LOCAL WORKFLOWS · {{ brandName }}</p><h1>Automation <span>Studio</span></h1>
      <div>Connect app events and schedules to conditional, multi-step social draft workflows.</div>
      <strong>Safe by default: automation creates drafts only. Publishing remains manual.</strong>
    </header>
    <p v-if="error" class="automation-studio__message automation-studio__message--error" role="alert">{{ error }}</p>
    <p v-if="message" class="automation-studio__message" role="status">{{ message }}</p>
    <div class="automation-studio__grid">
      <UiCard eyebrow="BUILDER" title="New workflow" description="Create a local rule for this brand; it starts paused.">
        <form class="automation-form" @submit.prevent="create">
          <UiField label="Workflow name" for-id="automation-name"><input id="automation-name" v-model="form.name" maxlength="80" required placeholder="Example: follow-up draft" /></UiField>
          <UiField label="Trigger" for-id="automation-trigger">
            <select id="automation-trigger" v-model="form.triggerType">
              <option value="manual">Manual run</option><option value="schedule">Scheduled</option><option value="social.post.created">Social post created</option>
            </select>
          </UiField>
          <UiField v-if="form.triggerType === 'schedule'" label="Repeat interval (minutes)" for-id="automation-interval" hint="Minimum 15 minutes; maximum 7 days.">
            <input id="automation-interval" v-model.number="form.intervalMinutes" type="number" min="15" max="10080" step="15" required />
          </UiField>
          <section class="automation-branch">
            <div class="automation-branch__heading"><strong>Conditions · all must match</strong><UiButton size="small" :disabled="form.conditions.length >= 5" @click.prevent="addCondition">Add condition</UiButton></div>
            <AutomationConditionRow v-for="(condition, index) in form.conditions" :key="index" v-model="form.conditions[index]" :index="index" @remove="form.conditions.splice(index, 1)" />
          </section>
          <section class="automation-branch">
            <div class="automation-branch__heading"><strong>If matched · draft actions</strong><UiButton size="small" :disabled="!canAddStep" @click.prevent="addAction('actions')">Add step</UiButton></div>
            <AutomationActionRow v-for="(action, index) in form.actions" :key="`yes-${index}`" v-model="form.actions[index]" :index="index" label="If matched" />
          </section>
          <details class="automation-else">
            <summary>If not matched · optional alternate branch</summary>
            <UiButton size="small" :disabled="form.elseActions.length >= 5" @click.prevent="addAction('elseActions')">Add alternate draft step</UiButton>
            <AutomationActionRow v-for="(action, index) in form.elseActions" :key="`no-${index}`" v-model="form.elseActions[index]" :index="index" label="If unmatched" />
          </details>
          <p class="automation-studio__provider-note">Email delivery and AI-authored rules are unavailable until a provider and consent controls are configured.</p>
          <UiButton type="submit" variant="primary" :disabled="busy">Save paused workflow</UiButton>
        </form>
      </UiCard>
      <div class="automation-studio__side">
        <AutomationRuleList :rules="rules" :busy="busy" @toggle="toggle" @run="run" @remove="remove" />
        <AutomationRunHistory :runs="runs" :busy="busy" @retry="retry" />
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss" src="./automation-studio.scss"></style>
