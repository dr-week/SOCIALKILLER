<script setup lang="ts">
import {
  Search,
  UserX,
  CheckCircle2,
  Loader2,
  ArrowDownAZ,
  ArrowUpAZ,
  Download
} from 'lucide-vue-next'
import type { View } from '../../types'

defineProps<{
  activeView: View
  searchQuery: string
  selectedCount: number
  pagedCount: number
  isBatchChecking: boolean
  batchProgress: { current: number; total: number }
  sortOrder: 'asc' | 'desc'
  filteredCount: number
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void
  (e: 'openQueue'): void
  (e: 'clearSelection'): void
  (e: 'selectAllVisible'): void
  (e: 'selectAllFiltered'): void
  (e: 'checkBatch'): void
  (e: 'toggleSort'): void
  (e: 'exportCsv'): void
}>()
</script>

<template>
  <div class="list-toolbar">
    <span class="guided-step-rail"><strong>{{ filteredCount }}</strong> Audience accounts</span>
    <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
      <button
        v-if="selectedCount > 0"
        class="button button--primary button--tiny"
        @click="emit('openQueue')"
        title="Open Safe Unfollow Queue"
      >
        <UserX :size="13" />
        <span>Queue ({{ selectedCount }})</span>
      </button>
      <button
        v-if="selectedCount > 0"
        class="button button--outline button--tiny"
        @click="emit('clearSelection')"
        title="Deselect all"
      >
        <span>Clear</span>
      </button>
      <button
        v-else-if="(activeView === 'not-following-back' || activeView === 'ghost-followers') && pagedCount > 0"
        class="button button--outline button--tiny"
        @click="emit('selectAllVisible')"
        title="Select all accounts on this page for queue"
      >
        <span>Select Page</span>
      </button>
      <button
        v-if="selectedCount === 0 && (activeView === 'not-following-back' || activeView === 'ghost-followers') && filteredCount > pagedCount"
        class="button button--outline button--tiny"
        @click="emit('selectAllFiltered')"
        :title="`Select all ${filteredCount} accounts matching the current list and search`"
      >
        <span>Select All {{ filteredCount }}</span>
      </button>

      <button
        class="button button--outline button--tiny"
        :class="{ 'button--active': isBatchChecking }"
        @click="emit('checkBatch')"
        :disabled="!pagedCount"
        :title="isBatchChecking ? 'Click to stop checking' : 'Check Instagram account health (active vs 404) for visible list'"
      >
        <component :is="isBatchChecking ? Loader2 : CheckCircle2" :size="13" :class="{ 'spin-icon': isBatchChecking }" />
        <span v-if="isBatchChecking">Checking {{ batchProgress.current }}/{{ batchProgress.total }}...</span>
        <span v-else>Check Status (Batch)</span>
      </button>

      <button
        class="button button--outline button--tiny"
        @click="emit('toggleSort')"
        :title="sortOrder === 'asc' ? 'Sorting A-Z' : 'Sorting Z-A'"
      >
        <component :is="sortOrder === 'asc' ? ArrowDownAZ : ArrowUpAZ" :size="13" />
        <span>{{ sortOrder === 'asc' ? 'A-Z' : 'Z-A' }}</span>
      </button>

      <button
        class="button button--outline button--tiny"
        @click="emit('exportCsv')"
        :disabled="!filteredCount"
      >
        <Download :size="13" />
        <span>Export CSV</span>
      </button>
    </div>
  </div>
</template>
