import type { Ref } from 'vue'

export interface QueueItem {
  username: string
  status: 'pending' | 'processing' | 'completed' | 'skipped'
  unfollowedAt?: number
}

export function createQueueTimer(countdownSeconds: Ref<number>) {
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  function clearTimers() {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  function getRandomDelay(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function startCountdown(seconds: number, onDone: () => void) {
    countdownSeconds.value = seconds
    clearTimers()
    countdownInterval = setInterval(() => {
      countdownSeconds.value -= 1
      if (countdownSeconds.value <= 0) {
        clearTimers()
        onDone()
      }
    }, 1000)
  }

  return { getRandomDelay, startCountdown, clearTimers }
}
