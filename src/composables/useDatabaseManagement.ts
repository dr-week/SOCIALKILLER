import { computed, type Ref } from 'vue'
import type { Person, Snapshot } from '../domain/followers'
import type { AccountStatus } from '../types'

export function useDatabaseManagement(
  followers: Ref<Person[]>,
  following: Ref<Person[]>,
  importedAt: Ref<string>,
  previous: Ref<Snapshot | null>,
  whitelist: Ref<Set<string>>,
  accountStatusMap: Ref<Map<string, AccountStatus>>
) {
  const databaseStats = computed(() => {
    let bytes = 0
    const keys = ['followdesk-current', 'followdesk-previous', 'followdesk-whitelist', 'followdesk-account-status']
    for (const k of keys) {
      const val = localStorage.getItem(k)
      if (val) bytes += val.length * 2
    }
    const kb = (bytes / 1024).toFixed(1)
    return { bytes, display: `${kb} KB` }
  })

  function cleanExpiredCache() {
    const savedAccountStatus = localStorage.getItem('followdesk-account-status')
    if (!savedAccountStatus) return
    try {
      const parsed = JSON.parse(savedAccountStatus) as Record<string, AccountStatus & { timestamp?: number }>
      const cleaned: Record<string, AccountStatus> = {}
      const now = Date.now()
      let removedCount = 0
      for (const [k, v] of Object.entries(parsed)) {
        if (v.timestamp && now - v.timestamp < 24 * 60 * 60 * 1000) {
          cleaned[k] = v
        } else {
          removedCount++
        }
      }
      localStorage.setItem('followdesk-account-status', JSON.stringify(cleaned))
      accountStatusMap.value = new Map(Object.entries(cleaned))
      alert(`Cleaned up ${removedCount} expired account status entries. Database optimized!`)
    } catch {}
  }

  function exportDatabaseBackup() {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      current: localStorage.getItem('followdesk-current'),
      previous: localStorage.getItem('followdesk-previous'),
      whitelist: Array.from(whitelist.value),
      accountStatus: localStorage.getItem('followdesk-account-status')
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `followdesk-backup-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function restoreDatabaseBackup(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string)
        if (backup.current) {
          localStorage.setItem('followdesk-current', backup.current)
          const parsed = JSON.parse(backup.current)
          followers.value = parsed.followers || []
          following.value = parsed.following || []
          importedAt.value = parsed.importedAt || ''
        }
        if (backup.previous) {
          localStorage.setItem('followdesk-previous', backup.previous)
          previous.value = JSON.parse(backup.previous)
        }
        if (Array.isArray(backup.whitelist)) {
          whitelist.value = new Set(backup.whitelist)
          localStorage.setItem('followdesk-whitelist', JSON.stringify(backup.whitelist))
        }
        if (backup.accountStatus) {
          localStorage.setItem('followdesk-account-status', backup.accountStatus)
          const parsedStatus = JSON.parse(backup.accountStatus)
          accountStatusMap.value = new Map(Object.entries(parsedStatus))
        }
        alert('Database backup restored successfully!')
      } catch {
        alert('Invalid backup file for The Social Base.')
      }
    }
    reader.readAsText(file)
  }

  return {
    databaseStats,
    cleanExpiredCache,
    exportDatabaseBackup,
    restoreDatabaseBackup
  }
}
