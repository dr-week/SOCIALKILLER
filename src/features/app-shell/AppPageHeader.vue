<script setup lang="ts">
import { Upload, X } from 'lucide-vue-next'
import type { View } from '../../types'

defineProps<{
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
</script>

<template>
  <section class="welcome-row">
    <h1>{{ title }}</h1>
    <div v-if="!workspaceMode && hasAudienceData" class="welcome-actions">
      <button class="button button--primary" @click="emit('triggerImport')">
        <Upload :size="14" /> Import
      </button>
    </div>
  </section>

  <div v-if="error" class="alert">
    <X :size="16" />
    <span>{{ error }}</span>
    <button aria-label="Dismiss" @click="emit('dismissError')">×</button>
  </div>
</template>
