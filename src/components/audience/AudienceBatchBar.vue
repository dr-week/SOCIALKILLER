<script setup lang="ts">
import { CheckSquare, Download, Star, UserX, X } from 'lucide-vue-next'

defineProps<{ selectedCount: number }>()

const emit = defineEmits<{
  (e: 'whitelistSelected'): void
  (e: 'queueSelected'): void
  (e: 'exportSelected'): void
  (e: 'clearSelection'): void
}>()
</script>

<template>
  <Transition name="slide-up">
    <div v-if="selectedCount > 0" class="floating-batch-bar" role="region" aria-label="Batch actions">
      <div class="batch-count-pill">
        <CheckSquare :size="14" class="text-indigo" />
        <span><strong>{{ selectedCount }}</strong> selected</span>
      </div>

      <div class="batch-divider"></div>

      <div class="batch-actions-group">
        <button class="batch-btn batch-btn--primary" title="Add all selected users to the Safe Unfollow Queue" @click="emit('queueSelected')">
          <UserX :size="13" /><span>Queue Unfollow</span>
        </button>
        <button class="batch-btn batch-btn--accent" title="Add all selected users to Safe List / Whitelist" @click="emit('whitelistSelected')">
          <Star :size="13" /><span>Protect in Safe List</span>
        </button>
        <button class="batch-btn batch-btn--ghost" title="Export only selected users to CSV" @click="emit('exportSelected')">
          <Download :size="13" /><span>Export CSV</span>
        </button>
      </div>

      <button class="batch-close-btn" title="Deselect all" aria-label="Deselect all" @click="emit('clearSelection')">
        <X :size="14" />
      </button>
    </div>
  </Transition>
</template>

<style scoped lang="scss" src="./styles/audience-batch-bar.scss"></style>
