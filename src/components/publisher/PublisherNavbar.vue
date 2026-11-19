<script setup lang="ts">
import {
  Layers,
  Radio,
  Send
} from 'lucide-vue-next'

export type PublisherTab =
  | 'compose'
  | 'campaigns'
  | 'channels'

defineProps<{
  activeTab: PublisherTab
  activeCount: number
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: PublisherTab): void
}>()

const TABS: Array<{ id: PublisherTab; label: string; icon: any; badge?: string }> = [
  { id: 'compose', label: 'Create', icon: Send },
  { id: 'campaigns', label: 'Queue', icon: Layers }
]
</script>

<template>
  <header class="publisher-minimal-header">
    <div class="header-top">
      <div class="brand-badge">
        <div class="pulse-dot"></div>
        <span class="brand-title">Publish</span>
      </div>

      <div class="stats-pills">
        <div class="stat-pill" title="Channels with credentials configured for this company">
          <Radio class="pill-icon text-emerald" />
          <span class="pill-val">{{ activeCount }}</span>
          <span class="pill-lbl">Channels</span>
        </div>
      </div>
    </div>

    <!-- Minimal Icon-Driven Tab Bar -->
    <nav class="publisher-tabs">
      <button
        v-for="t in TABS"
        :key="t.id"
        class="tab-btn"
        :class="{ active: activeTab === t.id }"
        @click="emit('update:activeTab', t.id)"
      >
        <component :is="t.icon" class="tab-icon" />
        <span class="tab-label">{{ t.label }}</span>
        <span v-if="t.badge" class="tab-badge">{{ t.badge }}</span>
      </button>
    </nav>
  </header>
</template>

<style scoped lang="scss" src="./publisher-navbar.scss"></style>
