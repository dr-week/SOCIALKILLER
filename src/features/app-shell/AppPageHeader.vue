<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Upload, X } from 'lucide-vue-next'
import type { View } from '../../types'

const props = defineProps<{
  activeView: View
  title: string
  hasAudienceData: boolean
  error: string
  workspaceMode: boolean
}>()

const emit = defineEmits<{
  (event: 'triggerImport'): void
  (event: 'loadDemo'): void
  (event: 'openGuide'): void
  (event: 'dismissError'): void
}>()

const subtitle = computed(() => {
  const copy: Partial<Record<View, string>> = {
    'social-publisher': 'Create, review and schedule posts.',
    'community-inbox': 'Review and reply to incoming comments and messages.'
  }
  return copy[props.activeView] || (props.hasAudienceData
    ? 'Compare followers, following, and changes.'
    : 'Import an Instagram export to compare relationships.')
})
</script>

<template>
  <section class="welcome-row">
    <div>
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="!workspaceMode" class="welcome-actions">
      <button v-if="!hasAudienceData" class="button button--outline" @click="emit('loadDemo')">
        <Sparkles :size="14" /> Preview Demo Data
      </button>
      <button class="button button--primary" @click="emit('triggerImport')">
        <Upload :size="14" /> {{ hasAudienceData ? 'Import New Data' : 'Upload Instagram Export' }}
      </button>
    </div>
  </section>

  <div v-if="error" class="alert">
    <X :size="16" />
    <span>{{ error }}</span>
    <button aria-label="Dismiss" @click="emit('dismissError')">×</button>
  </div>
</template>
