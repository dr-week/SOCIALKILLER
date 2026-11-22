<script setup lang="ts">
import type { Lead } from './leads-api'
import { Trash2 } from 'lucide-vue-next'

const props = defineProps<{ lead: Lead }>()
const emit = defineEmits<{
  (e: 'change-status', status: Lead['status']): void
  (e: 'remove'): void
}>()

const statusOptions: Lead['status'][] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']
</script>

<template>
  <div class="lead-card" :data-intent="lead.intent">
    <div class="lead-card-header">
      <div class="lead-info">
        <span class="lead-name">{{ lead.contactName }}</span>
        <span v-if="lead.handle" class="lead-handle">@{{ lead.handle }}</span>
      </div>
      <button class="lead-delete-btn" title="Delete lead" @click="emit('remove')">
        <Trash2 :size="13" />
      </button>
    </div>

    <p v-if="lead.message" class="lead-message">{{ lead.message }}</p>

    <div class="lead-meta">
      <span class="lead-badge platform-badge">{{ lead.platformId }}</span>
      <span v-if="lead.triggerWord" class="lead-badge trigger-badge">{{ lead.triggerWord }}</span>
      <span class="lead-badge intent-badge">{{ lead.intent }}</span>
    </div>

    <div class="lead-actions">
      <select
        :value="lead.status"
        class="lead-status-select"
        @change="emit('change-status', ($event.target as HTMLSelectElement).value as Lead['status'])"
      >
        <option v-for="opt in statusOptions" :key="opt" :value="opt">
          {{ opt.toUpperCase() }}
        </option>
      </select>
    </div>
  </div>
</template>
