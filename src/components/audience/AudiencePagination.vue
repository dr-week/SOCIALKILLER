<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
}>()

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
}>()
</script>

<template>
  <div class="pagination-bar">
    <span>Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} total accounts)</span>
    <div class="pagination-controls">
      <button
        class="button button--outline button--tiny"
        :disabled="currentPage <= 1"
        aria-label="Previous page"
        @click="emit('update:currentPage', currentPage - 1)"
      >
        <ChevronLeft :size="13" />
      </button>
      <button
        class="button button--outline button--tiny"
        :disabled="currentPage >= totalPages"
        aria-label="Next page"
        @click="emit('update:currentPage', currentPage + 1)"
      >
        <ChevronRight :size="13" />
      </button>
    </div>
  </div>
</template>
