import { ref } from 'vue'
import { normalizeUsername } from '../domain/followers'
import type { AccountStatus } from '../types'

const accountStatusMap = ref<Map<string, AccountStatus>>(new Map())
const isBatchChecking = ref(false)
const batchProgress = ref({ current: 0, total: 0 })

// Restore cached statuses (24 hour TTL)
try {
  const savedAccountStatus = localStorage.getItem('followdesk-account-status')
  if (savedAccountStatus) {
    const parsed = JSON.parse(savedAccountStatus) as Record<string, AccountStatus & { timestamp?: number }>
    const map = new Map<string, AccountStatus>()
    const now = Date.now()
    for (const [k, v] of Object.entries(parsed)) {
      if (!v.timestamp || now - v.timestamp < 24 * 60 * 60 * 1000) {
        map.set(k, v)
      }
    }
    accountStatusMap.value = map
  }
} catch {}

function saveAccountStatusToStorage() {
  try {
    const obj = Object.fromEntries(accountStatusMap.value)
    localStorage.setItem('followdesk-account-status', JSON.stringify(obj))
  } catch {}
}

export function useAccountHealth() {
  async function checkAccountHealth(username: string) {
    const norm = normalizeUsername(username)
    if (accountStatusMap.value.get(norm)?.status === 'checking') return
    accountStatusMap.value.set(norm, { status: 'checking', reason: 'Checking Instagram...' })
    try {
      const res = await fetch(`/api/instagram/check-status?username=${encodeURIComponent(username)}`)
      const data = await res.json() as { status: 'active' | 'deactivated' | 'rate_limited' | 'unknown'; reason: string }
      const entry: AccountStatus = { status: data.status || 'unknown', reason: data.reason || '', timestamp: Date.now() }
      accountStatusMap.value.set(norm, entry)
      saveAccountStatusToStorage()
    } catch {
      accountStatusMap.value.set(norm, { status: 'unknown', reason: 'Could not connect to status checker', timestamp: Date.now() })
    }
  }

  async function checkBatch(usernames: string[]) {
    if (isBatchChecking.value) {
      isBatchChecking.value = false
      return
    }
    const toCheck = usernames.filter(u => !accountStatusMap.value.has(normalizeUsername(u)))
    if (!toCheck.length) return

    isBatchChecking.value = true
    batchProgress.value = { current: 0, total: toCheck.length }

    for (let i = 0; i < toCheck.length; i++) {
      if (!isBatchChecking.value) break
      batchProgress.value.current = i + 1
      await checkAccountHealth(toCheck[i])
      if (i < toCheck.length - 1) {
        await new Promise(r => setTimeout(r, 1500))
      }
    }
    isBatchChecking.value = false
  }

  return {
    accountStatusMap,
    isBatchChecking,
    batchProgress,
    checkAccountHealth,
    checkBatch
  }
}
