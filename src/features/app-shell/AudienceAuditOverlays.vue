<script setup lang="ts">
import type { AppController } from './useAppController'
import AudienceQueuePill from '../../components/audience/AudienceQueuePill.vue'
import AudienceExportGuideModal from '../../components/audience/AudienceExportGuideModal.vue'
import UnfollowQueueModal from '../../components/UnfollowQueueModal.vue'

const props = defineProps<{ controller: AppController }>()
const { fileInput, showExportGuide, queueState, audience, navigation } = props.controller
const {
  queue, isQueueOpen, isRunning, isPaused, currentIndex, countdownSeconds,
  minDelaySec, maxDelaySec, sessionLimit, autoOpenProfile, activePreset,
  completedCount, skippedCount, pendingCount, currentItem, progressPercent,
  openQueueModal, closeQueueModal, startQueue, pauseQueue, resumeQueue, stopQueue,
  skipCurrent, markDoneAndNext, removeFromQueue, setPacingPreset
} = queueState
const { resetData, importedAt, toggleWhitelist } = audience

function handleWhitelistCurrent(username: string) {
  toggleWhitelist(username)
  skipCurrent()
}
</script>

<template>
  <UnfollowQueueModal
    :is-open="isQueueOpen" :queue="queue" :is-running="isRunning" :is-paused="isPaused"
    :current-index="currentIndex" :countdown-seconds="countdownSeconds"
    :completed-count="completedCount" :skipped-count="skippedCount"
    :pending-count="pendingCount" :progress-percent="progressPercent"
    :min-delay-sec="minDelaySec" :max-delay-sec="maxDelaySec"
    :session-limit="sessionLimit" :auto-open-profile="autoOpenProfile"
    :active-preset="activePreset" :current-item="currentItem"
    @close="closeQueueModal" @start="startQueue" @pause="pauseQueue"
    @resume="resumeQueue" @stop="stopQueue" @skip="skipCurrent"
    @mark-done="markDoneAndNext" @whitelist-current="handleWhitelistCurrent"
    @remove-item="removeFromQueue" @set-preset="setPacingPreset"
    @update:session-limit="(val) => { sessionLimit = val }"
    @update:auto-open-profile="(val) => { autoOpenProfile = val }"
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
