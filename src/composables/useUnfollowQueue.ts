import { computed, ref } from 'vue'
import { createQueueTimer, type QueueItem } from './unfollow-queue-timer'

export type { QueueItem }

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

  const timer = createQueueTimer(countdownSeconds)
  const isSelected = (username: string) => selectedUsernames.value.has(username)

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
    queue.value = Array.from(selectedUsernames.value).map(username => ({ username, status: 'pending' }))
    currentIndex.value = 0
    isRunning.value = false
    isPaused.value = false
    isQueueOpen.value = true
  }

  function closeQueueModal() {
    stopQueue()
    isQueueOpen.value = false
  }

  function processNext() {
    if (!isRunning.value || isPaused.value) return
    if (currentIndex.value >= queue.value.length) { isRunning.value = false; return }

    const item = queue.value[currentIndex.value]
    if (!item) return
    item.status = 'processing'

    timer.startCountdown(timer.getRandomDelay(minDelaySec.value, maxDelaySec.value), () => {
      if (!isRunning.value || isPaused.value) return
      item.status = 'completed'
      item.unfollowedAt = Date.now()

      const next = new Set(selectedUsernames.value)
      next.delete(item.username)
      selectedUsernames.value = next

      currentIndex.value += 1
      if (currentIndex.value < queue.value.length) processNext()
      else isRunning.value = false
    })
  }

  function startQueue() {
    if (isRunning.value) return
    isRunning.value = true
    isPaused.value = false
    processNext()
  }

  function pauseQueue() {
    isPaused.value = true
    isRunning.value = false
    timer.clearTimers()
  }

  function resumeQueue() {
    if (isRunning.value) return
    isPaused.value = false
    isRunning.value = true
    processNext()
  }

  function stopQueue() {
    isRunning.value = false
    isPaused.value = false
    countdownSeconds.value = 0
    timer.clearTimers()
  }

  const completedCount = computed(() => queue.value.filter(item => item.status === 'completed').length)
  const pendingCount = computed(() => queue.value.filter(item => item.status === 'pending').length)
  const currentItem = computed(() => queue.value[currentIndex.value] || null)

  return {
    selectedUsernames, queue, isQueueOpen, isRunning, isPaused, currentIndex, countdownSeconds,
    minDelaySec, maxDelaySec, sessionLimit, completedCount, pendingCount, currentItem,
    isSelected, toggleSelect, selectAll, clearSelection, openQueueModal, closeQueueModal,
    startQueue, pauseQueue, resumeQueue, stopQueue
  }
}
