<script setup lang="ts">
import type { AppController } from './useAppController'
import AudienceQueuePill from '../../components/audience/AudienceQueuePill.vue'
import AudienceExportGuideModal from '../../components/audience/AudienceExportGuideModal.vue'
import UnfollowQueueModal from '../../components/UnfollowQueueModal.vue'

const props = defineProps<{ controller: AppController }>()
const { fileInput, showExportGuide, queueState, audience, navigation } = props.controller
const {
  queue, isQueueOpen, isRunning, isPaused, currentIndex, countdownSeconds,
  completedCount, pendingCount, currentItem, openQueueModal, closeQueueModal,
  startQueue, pauseQueue, resumeQueue, stopQueue
} = queueState
const { resetData, importedAt } = audience
</script>

<template>
  <UnfollowQueueModal
    :is-open="isQueueOpen" :queue="queue" :is-running="isRunning" :is-paused="isPaused"
    :current-index="currentIndex" :countdown-seconds="countdownSeconds"
    :completed-count="completedCount" :pending-count="pendingCount" :current-item="currentItem"
    @close="closeQueueModal" @start="startQueue" @pause="pauseQueue" @resume="resumeQueue" @stop="stopQueue"
  />
  <AudienceQueuePill
    v-if="!isQueueOpen && (isRunning || isPaused)"
    :is-running="isRunning" :is-paused="isPaused" :completed-count="completedCount"
    :total-count="queue.length" :countdown-seconds="countdownSeconds" :current-user="currentItem?.username"
    @maximize="openQueueModal" @pause="pauseQueue" @resume="resumeQueue"
  />
  <AudienceExportGuideModal :is-open="showExportGuide" @close="showExportGuide = false" @trigger-import="fileInput?.click()" />
  <footer class="page-footer">
    <span>SOCIALKILLER · AUDIENCE AUDIT</span>
    <span class="data-note">
      Local storage only
      <template v-if="importedAt"> · {{ navigation.lastSynced.value }} · <button type="button" @click="resetData">Clear</button></template>
    </span>
  </footer>
</template>
