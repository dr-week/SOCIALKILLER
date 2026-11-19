import { ref, computed } from 'vue'

export interface QueueItem {
  username: string
  status: 'pending' | 'processing' | 'completed' | 'skipped'
  unfollowedAt?: number
}

export function useUnfollowQueue() {
  const selectedUsernames = ref<Set<string>>(new Set())
  const queue = ref<QueueItem[]>([])
  const isQueueOpen = ref(false)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const currentIndex = ref(0)
  const countdownSeconds = ref(0)
  
  // Safe human delay range (seconds)
  const minDelaySec = ref(15)
  const maxDelaySec = ref(35)
  const sessionLimit = ref(25) // Instagram safety recommendation: max 25-30 actions per hour/session

  let timerHandle: ReturnType<typeof setTimeout> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  const isSelected = (username: string) => selectedUsernames.value.has(username)

  const toggleSelect = (username: string) => {
    const next = new Set(selectedUsernames.value)
    if (next.has(username)) {
      next.delete(username)
    } else {
      next.add(username)
    }
    selectedUsernames.value = next
  }

  const selectAll = (usernames: string[]) => {
    const next = new Set(selectedUsernames.value)
    for (const u of usernames) {
      next.add(u)
    }
    selectedUsernames.value = next
  }

  const clearSelection = () => {
    selectedUsernames.value = new Set()
  }

  const openQueueModal = () => {
    if (selectedUsernames.value.size === 0) return
    // Initialize queue from selection
    queue.value = Array.from(selectedUsernames.value).map(username => ({
      username,
      status: 'pending'
    }))
    currentIndex.value = 0
    isRunning.value = false
    isPaused.value = false
    isQueueOpen.value = true
  }

  const closeQueueModal = () => {
    stopQueue()
    isQueueOpen.value = false
  }

  const getRandomDelay = () => {
    const min = minDelaySec.value
    const max = maxDelaySec.value
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const startCountdown = (seconds: number, onDone: () => void) => {
    countdownSeconds.value = seconds
    if (countdownInterval) clearInterval(countdownInterval)

    countdownInterval = setInterval(() => {
      countdownSeconds.value -= 1
      if (countdownSeconds.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval)
        countdownInterval = null
        onDone()
      }
    }, 1000)
  }

  const processNext = () => {
    if (!isRunning.value || isPaused.value) return
    if (currentIndex.value >= queue.value.length) {
      isRunning.value = false
      return
    }

    const currentItem = queue.value[currentIndex.value]
    if (!currentItem) return

    currentItem.status = 'processing'

    // Simulate safe anti-ban human delay before confirming the action
    const delay = getRandomDelay()
    startCountdown(delay, () => {
      if (!isRunning.value || isPaused.value) return
      currentItem.status = 'completed'
      currentItem.unfollowedAt = Date.now()
      
      // Remove from selected set
      const next = new Set(selectedUsernames.value)
      next.delete(currentItem.username)
      selectedUsernames.value = next

      currentIndex.value += 1
      if (currentIndex.value < queue.value.length) {
        processNext()
      } else {
        isRunning.value = false
      }
    })
  }

  const startQueue = () => {
    if (isRunning.value) return
    isRunning.value = true
    isPaused.value = false
    processNext()
  }

  const pauseQueue = () => {
    isPaused.value = true
    isRunning.value = false
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    if (timerHandle) {
      clearTimeout(timerHandle)
      timerHandle = null
    }
  }

  const resumeQueue = () => {
    if (isRunning.value) return
    isPaused.value = false
    isRunning.value = true
    processNext()
  }

  const stopQueue = () => {
    isRunning.value = false
    isPaused.value = false
    countdownSeconds.value = 0
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    if (timerHandle) {
      clearTimeout(timerHandle)
      timerHandle = null
    }
  }

  const completedCount = computed(() => queue.value.filter(item => item.status === 'completed').length)
  const pendingCount = computed(() => queue.value.filter(item => item.status === 'pending').length)
  const currentItem = computed(() => queue.value[currentIndex.value] || null)

  return {
    selectedUsernames,
    queue,
    isQueueOpen,
    isRunning,
    isPaused,
    currentIndex,
    countdownSeconds,
    minDelaySec,
    maxDelaySec,
    sessionLimit,
    completedCount,
    pendingCount,
    currentItem,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    openQueueModal,
    closeQueueModal,
    startQueue,
    pauseQueue,
    resumeQueue,
    stopQueue
  }
}
