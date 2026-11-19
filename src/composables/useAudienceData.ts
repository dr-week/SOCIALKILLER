import { ref, computed } from 'vue'
import {
  analyzeFollowers,
  compareFollowers,
  identifyGhostFollowers,
  normalizeUsername,
  type Person,
  type Snapshot
} from '../domain/followers'
import { readInstagramFiles } from '../domain/instagram-export'

import type { AccountRecord, AccountSummary } from '../types'

const followers = ref<Person[]>([])
const following = ref<Person[]>([])
const currentAccountUsername = ref<string>('')
const savedAccounts = ref<Record<string, AccountRecord>>({})
const previous = ref<Snapshot | null>(null)
const whitelist = ref<Set<string>>(new Set())
const importedAt = ref<string>('')
const loading = ref(false)
const error = ref('')

// Load existing state from localStorage
try {
  const storedAccounts = localStorage.getItem('followdesk-accounts')
  if (storedAccounts) {
    savedAccounts.value = JSON.parse(storedAccounts)
  }

  const current = localStorage.getItem('followdesk-current')
  if (current) {
    const data = JSON.parse(current) as AccountRecord
    followers.value = data.followers || []
    following.value = data.following || []
    importedAt.value = data.importedAt || ''
    if (data.username) {
      currentAccountUsername.value = data.username
      if (!savedAccounts.value[data.username.toLowerCase()]) {
        savedAccounts.value[data.username.toLowerCase()] = data
      }
    }
  }

  const old = localStorage.getItem('followdesk-previous')
  if (old) previous.value = JSON.parse(old) as Snapshot

  const savedWhitelist = localStorage.getItem('followdesk-whitelist')
  if (savedWhitelist) {
    whitelist.value = new Set(JSON.parse(savedWhitelist) as string[])
  }
} catch {
  localStorage.removeItem('followdesk-current')
  localStorage.removeItem('followdesk-previous')
}

let lastAppliedSync = ''

function persistAccount(acc: AccountRecord) {
  const norm = (acc.username || 'user').toLowerCase()
  savedAccounts.value[norm] = acc
  try {
    localStorage.setItem('followdesk-accounts', JSON.stringify(savedAccounts.value))
  } catch {}
}

async function checkForExtensionSync() {
  try {
    const res = await fetch('/api/instagram/sync')
    if (!res.ok) return
    const json = await res.json()
    if (json.synced && json.data) {
      const data = json.data
      const syncStamp = data.syncedAt || ''
      if (syncStamp && syncStamp === lastAppliedSync) return

      if (Array.isArray(data.followers) && Array.isArray(data.following) && data.followers.length > 0) {
        lastAppliedSync = syncStamp
        const incomingUser = data.username || 'user'

        const accountRec: AccountRecord = {
          followers: data.followers,
          following: data.following,
          username: incomingUser,
          importedAt: syncStamp || new Date().toISOString()
        }
        persistAccount(accountRec)

        // If no account currently selected or matches current, update active view
        if (!currentAccountUsername.value || currentAccountUsername.value.toLowerCase() === incomingUser.toLowerCase()) {
          currentAccountUsername.value = incomingUser
          if (followers.value.length || following.value.length) {
            previous.value = {
              date: importedAt.value || new Date().toISOString(),
              followers: followers.value,
              following: following.value
            }
            localStorage.setItem('followdesk-previous', JSON.stringify(previous.value))
          }
          followers.value = data.followers
          following.value = data.following
          importedAt.value = accountRec.importedAt
          localStorage.setItem('followdesk-current', JSON.stringify(accountRec))
        }
      }
    }
  } catch {}
}

setInterval(checkForExtensionSync, 3000)
void checkForExtensionSync()

export function useAudienceData() {
  const connections = computed(() => analyzeFollowers(followers.value, following.value))
  const rawNotFollowingBack = computed(() => connections.value.notFollowingBack)
  const notFollowingBack = computed(() =>
    rawNotFollowingBack.value.filter(p => !whitelist.value.has(normalizeUsername(p.username)))
  )
  const notFollowedBack = computed(() => connections.value.notFollowedBack)
  const mutuals = computed(() => connections.value.mutuals)

  const changes = computed(() => compareFollowers(previous.value, followers.value))
  const newFollowers = computed(() => changes.value.newFollowers)
  const lostFollowers = computed(() => changes.value.lostFollowers)

  const ghostFollowers = computed(() =>
    identifyGhostFollowers(followers.value, following.value).filter(
      p => !whitelist.value.has(normalizeUsername(p.username))
    )
  )

  const allAccounts = computed(() => {
    const map = new Map<string, Person>()
    for (const p of [...following.value, ...followers.value]) {
      map.set(normalizeUsername(p.username), p)
    }
    return [...map.values()]
  })

  const whitelistedPeople = computed(() => {
    const allKnown = new Map<string, Person>()
    for (const p of [...following.value, ...followers.value]) {
      allKnown.set(normalizeUsername(p.username), p)
    }
    return [...whitelist.value].map(
      u => allKnown.get(u) || { username: u, href: `https://www.instagram.com/${encodeURIComponent(u)}/` }
    )
  })

  function toggleWhitelist(username: string) {
    const norm = normalizeUsername(username)
    if (whitelist.value.has(norm)) {
      whitelist.value.delete(norm)
    } else {
      whitelist.value.add(norm)
    }
    localStorage.setItem('followdesk-whitelist', JSON.stringify([...whitelist.value]))
  }

  async function importFiles(files: FileList | File[]) {
    error.value = ''
    loading.value = true
    try {
      const selected = Array.from(files)
      if (!selected.length) return
      const groups = await readInstagramFiles(selected)
      if (!groups.has('followers') || !groups.has('following')) {
        throw new Error(
          'Please select your followers and following export files (e.g. followers_1.json and following.json or the export ZIP).'
        )
      }
      const nextFollowers = groups.get('followers')!
      const nextFollowing = groups.get('following')!
      if (followers.value.length || following.value.length) {
        previous.value = {
          date: importedAt.value || new Date().toISOString(),
          followers: followers.value,
          following: following.value
        }
      }
      followers.value = nextFollowers
      following.value = nextFollowing
      importedAt.value = new Date().toISOString()
      localStorage.setItem(
        'followdesk-current',
        JSON.stringify({
          followers: nextFollowers,
          following: nextFollowing,
          importedAt: importedAt.value
        })
      )
      if (previous.value) localStorage.setItem('followdesk-previous', JSON.stringify(previous.value))
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not read these files.'
    } finally {
      loading.value = false
    }
  }

  function loadSampleData() {
    const sampleFollowers: Person[] = [
      { username: 'alex_creator', href: 'https://www.instagram.com/alex_creator/' },
      { username: 'design_studio_nyc', href: 'https://www.instagram.com/design_studio_nyc/' },
      { username: 'sarah_travels', href: 'https://www.instagram.com/sarah_travels/' },
      { username: 'hyperdrive_studio', href: 'https://www.instagram.com/hyperdrive_studio/' },
      { username: 'mark_coder', href: 'https://www.instagram.com/mark_coder/' },
      { username: 'photo_luna', href: 'https://www.instagram.com/photo_luna/' },
      { username: 'emma_art', href: 'https://www.instagram.com/emma_art/' },
      { username: 'dan_music', href: 'https://www.instagram.com/dan_music/' }
    ]
    const sampleFollowing: Person[] = [
      { username: 'alex_creator', href: 'https://www.instagram.com/alex_creator/' },
      { username: 'sarah_travels', href: 'https://www.instagram.com/sarah_travels/' },
      { username: 'hyperdrive_studio', href: 'https://www.instagram.com/hyperdrive_studio/' },
      { username: 'natgeo', href: 'https://www.instagram.com/natgeo/' },
      { username: 'apple', href: 'https://www.instagram.com/apple/' },
      { username: 'nasa', href: 'https://www.instagram.com/nasa/' },
      { username: 'dan_music', href: 'https://www.instagram.com/dan_music/' },
      { username: 'techcrunch', href: 'https://www.instagram.com/techcrunch/' }
    ]
    const prevFollowers: Person[] = [
      { username: 'alex_creator', href: 'https://www.instagram.com/alex_creator/' },
      { username: 'sarah_travels', href: 'https://www.instagram.com/sarah_travels/' },
      { username: 'hyperdrive_studio', href: 'https://www.instagram.com/hyperdrive_studio/' },
      { username: 'old_friend_99', href: 'https://www.instagram.com/old_friend_99/' },
      { username: 'mark_coder', href: 'https://www.instagram.com/mark_coder/' }
    ]
    currentAccountUsername.value = 'alex_creator'
    followers.value = sampleFollowers
    following.value = sampleFollowing
    previous.value = {
      date: new Date(Date.now() - 7 * 86400000).toISOString(),
      followers: prevFollowers,
      following: sampleFollowing
    }
    importedAt.value = new Date().toISOString()
    const sampleRecord: AccountRecord = {
      followers: sampleFollowers,
      following: sampleFollowing,
      importedAt: importedAt.value,
      username: 'alex_creator'
    }
    persistAccount(sampleRecord)
    localStorage.setItem('followdesk-current', JSON.stringify(sampleRecord))
    localStorage.setItem('followdesk-previous', JSON.stringify(previous.value))
  }

  function switchAccount(username: string) {
    const norm = (username || '').toLowerCase()
    const target = savedAccounts.value[norm]
    if (!target) return

    // Save previous snapshot of current account if available
    if (followers.value.length || following.value.length) {
      previous.value = {
        date: importedAt.value || new Date().toISOString(),
        followers: followers.value,
        following: following.value
      }
      localStorage.setItem('followdesk-previous', JSON.stringify(previous.value))
    }

    currentAccountUsername.value = target.username
    followers.value = target.followers || []
    following.value = target.following || []
    importedAt.value = target.importedAt || new Date().toISOString()
    localStorage.setItem('followdesk-current', JSON.stringify(target))
  }

  function removeAccount(username: string) {
    const norm = (username || '').toLowerCase()
    delete savedAccounts.value[norm]
    try {
      localStorage.setItem('followdesk-accounts', JSON.stringify(savedAccounts.value))
    } catch {}

    if (currentAccountUsername.value.toLowerCase() === norm) {
      const remaining = Object.values(savedAccounts.value)
      if (remaining.length > 0) {
        switchAccount(remaining[0].username)
      } else {
        followers.value = []
        following.value = []
        currentAccountUsername.value = ''
        importedAt.value = ''
        previous.value = null
        localStorage.removeItem('followdesk-current')
      }
    }
  }

  async function refreshCurrentAccount() {
    if (!currentAccountUsername.value) return
    loading.value = true
    error.value = ''
    try {
      const res = await fetch(`/api/instagram/sync?username=${encodeURIComponent(currentAccountUsername.value)}`)
      if (!res.ok) throw new Error('Could not contact sync server.')
      const json = await res.json()
      if (json.synced && json.data) {
        const data = json.data
        followers.value = data.followers || []
        following.value = data.following || []
        importedAt.value = data.syncedAt || new Date().toISOString()
        const updated: AccountRecord = {
          followers: followers.value,
          following: following.value,
          username: currentAccountUsername.value,
          importedAt: importedAt.value
        }
        persistAccount(updated)
        localStorage.setItem('followdesk-current', JSON.stringify(updated))
      } else {
        throw new Error(`No recent scan found on backend for @${currentAccountUsername.value}. Open Instagram on their profile and click Scan in SOCIALKILLER companion.`)
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Refresh failed.'
    } finally {
      loading.value = false
    }
  }

  function resetData() {
    if (!confirm('Remove imported Instagram data from this browser?')) return
    followers.value = []
    following.value = []
    currentAccountUsername.value = ''
    previous.value = null
    importedAt.value = ''
    whitelist.value.clear()
    savedAccounts.value = {}
    localStorage.removeItem('followdesk-current')
    localStorage.removeItem('followdesk-previous')
    localStorage.removeItem('followdesk-whitelist')
    localStorage.removeItem('followdesk-account-status')
    localStorage.removeItem('followdesk-accounts')
  }

  const savedAccountsList = computed(() => {
    return Object.values(savedAccounts.value).map(acc => ({
      username: acc.username,
      followersCount: acc.followers?.length || 0,
      followingCount: acc.following?.length || 0,
      syncedAt: acc.importedAt
    }))
  })

  return {
    followers,
    following,
    currentAccountUsername,
    savedAccounts,
    savedAccountsList,
    switchAccount,
    removeAccount,
    refreshCurrentAccount,
    previous,
    whitelist,
    importedAt,
    loading,
    error,
    notFollowingBack,
    notFollowedBack,
    mutuals,
    newFollowers,
    lostFollowers,
    ghostFollowers,
    allAccounts,
    whitelistedPeople,
    toggleWhitelist,
    importFiles,
    loadSampleData,
    resetData
  }
}
