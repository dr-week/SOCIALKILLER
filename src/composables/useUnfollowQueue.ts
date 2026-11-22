import { computed, ref } from 'vue'
import { createQueueTimer, type QueueItem } from './unfollow-queue-timer'

export type { QueueItem }
export type PacingPreset = 'ultra' | 'balanced' | 'fast'

const PRESET_RANGES: Record<PacingPreset, [number, number]> = {
  ultra: [30, 60],
  balanced: [15, 35],
  fast: [8, 18]
}

export function useUnfollowQueue() {
  const selectedUsernames = ref<Set<string>>(new Set())
  const queue = ref<QueueItem[]>([])
  const isQueueOpen = ref(false)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const currentIndex = ref(0)
  const countdownSeconds = ref(0)

  const minDelaySec = ref(15)
  const maxDelaySec = ref(35)
  const sessionLimit = ref(25)
  const autoOpenProfile = ref(false)
  const activePreset = ref<PacingPreset>('balanced')

  const timer = createQueueTimer(countdownSeconds)
  const isSelected = (username: string) => selectedUsernames.value.has(username)

  function setPacingPreset(preset: PacingPreset) {
    activePreset.value = preset
    const [min, max] = PRESET_RANGES[preset]
    minDelaySec.value = min
    maxDelaySec.value = max
  }

  function toggleSelect(username: string) {
    const next = new Set(selectedUsernames.value)
    if (next.has(username)) next.delete(username)
    else next.add(username)
    selectedUsernames.value = next
  }

  function selectAll(usernames: string[]) {
    const next = new Set(selectedUsernames.value)
    for (const u of usernames) next.add(u)
    selectedUsernames.value = next
  }

  function clearSelection() {
    selectedUsernames.value = new Set()
  }

  function openQueueModal() {
    if (selectedUsernames.value.size === 0) return
    const capped = Array.from(selectedUsernames.value).slice(0, sessionLimit.value)
    queue.value = capped.map(username => ({ username, status: 'pending' }))
    currentIndex.value = 0
    isRunning.value = false
    isPaused.value = false
    isQueueOpen.value = true
  }

  function closeQueueModal() {
    stopQueue()
    isQueueOpen.value = false
  }

  function advanceWithStatus(status: 'completed' | 'skipped') {
    const item = queue.value[currentIndex.value]
    if (!item) return
    timer.clearTimers()
    countdownSeconds.value = 0
    item.status = status
    if (status === 'completed') item.unfollowedAt = Date.now()

    const next = new Set(selectedUsernames.value)
    next.delete(item.username)
    selectedUsernames.value = next

    void fetch('/api/audience/unfollow-log', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: item.username, status })
    }).catch(() => {})

    currentIndex.value += 1
    if (isRunning.value && !isPaused.value) {
      if (currentIndex.value < queue.value.length) processNext()
      else isRunning.value = false
    }
  }

  function processNext() {
    if (!isRunning.value || isPaused.value) return
    if (currentIndex.value >= queue.value.length) { isRunning.value = false; return }

    const item = queue.value[currentIndex.value]
    if (!item) return
    item.status = 'processing'

    if (autoOpenProfile.value && typeof window !== 'undefined') {
      const url = `https://www.instagram.com/${encodeURIComponent(item.username)}/#sk_review=1`
      window.open(url, 'socialkiller_ig_review', 'noopener')
    }

    timer.startCountdown(timer.getRandomDelay(minDelaySec.value, maxDelaySec.value), () => {
      if (!isRunning.value || isPaused.value) return
      advanceWithStatus('completed')
    })
  }

  function startQueue() {
    if (isRunning.value) return
    isRunning.value = true; isPaused.value = false; processNext()
  }
  function pauseQueue() { isPaused.value = true; isRunning.value = false; timer.clearTimers() }
  function resumeQueue() {
    if (isRunning.value) return
    isPaused.value = false; isRunning.value = true; processNext()
  }
  function stopQueue() {
    isRunning.value = false; isPaused.value = false; countdownSeconds.value = 0; timer.clearTimers()
  }
  function skipCurrent() { advanceWithStatus('skipped') }
  function markDoneAndNext() { advanceWithStatus('completed') }
  function removeFromQueue(username: string) {
    queue.value = queue.value.filter(item => !(item.username === username && item.status === 'pending'))
  }

  const completedCount = computed(() => queue.value.filter(i => i.status === 'completed').length)
  const skippedCount = computed(() => queue.value.filter(i => i.status === 'skipped').length)
  const pendingCount = computed(() => queue.value.filter(i => i.status === 'pending' || i.status === 'processing').length)
  const currentItem = computed(() => queue.value[currentIndex.value] || null)
  const progressPercent = computed(() =>
    queue.value.length ? Math.round(((completedCount.value + skippedCount.value) / queue.value.length) * 100) : 0
  )

  return {
    selectedUsernames, queue, isQueueOpen, isRunning, isPaused, currentIndex, countdownSeconds,
    minDelaySec, maxDelaySec, sessionLimit, autoOpenProfile, activePreset,
    completedCount, skippedCount, pendingCount, currentItem, progressPercent,
    isSelected, toggleSelect, selectAll, clearSelection, openQueueModal, closeQueueModal,
    startQueue, pauseQueue, resumeQueue, stopQueue, skipCurrent, markDoneAndNext,
    removeFromQueue, setPacingPreset
  }
}
