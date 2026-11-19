import { computed, ref } from 'vue'
import { analyzeFollowers, compareFollowers, identifyGhostFollowers, normalizeUsername, type Person, type Snapshot } from '../domain/followers'
import { readInstagramFiles } from '../domain/instagram-export'
import type { AccountRecord } from '../types'
import { clearAudienceStorage, clearCurrentAccount, createSampleAudienceData, loadAudienceStorage, saveAccountsMap, saveCurrentAccount, savePreviousSnapshot, saveWhitelist } from './audience-storage'
import { fetchAccountSync, fetchExtensionSync } from './audience-sync'

const initial = loadAudienceStorage()
const followers = ref<Person[]>(initial.current?.followers || [])
const following = ref<Person[]>(initial.current?.following || [])
const currentAccountUsername = ref<string>(initial.current?.username || '')
const savedAccounts = ref<Record<string, AccountRecord>>(initial.savedAccounts)
const previous = ref<Snapshot | null>(initial.previous)
const whitelist = ref<Set<string>>(initial.whitelist)
const importedAt = ref<string>(initial.current?.importedAt || '')
const loading = ref(false)
const error = ref('')
let lastAppliedSync = ''

function persistAccount(acc: AccountRecord) {
  savedAccounts.value[(acc.username || 'user').toLowerCase()] = acc
  saveAccountsMap(savedAccounts.value)
}

function recordPreviousSnapshot() {
  if (!followers.value.length && !following.value.length) return
  previous.value = { date: importedAt.value || new Date().toISOString(), followers: followers.value, following: following.value }
  savePreviousSnapshot(previous.value)
}

async function checkForExtensionSync() {
  const data = await fetchExtensionSync()
  if (!data || !Array.isArray(data.followers) || !Array.isArray(data.following) || data.followers.length === 0) return
  const syncStamp = data.syncedAt || ''
  if (syncStamp && syncStamp === lastAppliedSync) return
  lastAppliedSync = syncStamp
  const incomingUser = data.username || 'user'
  const accountRec: AccountRecord = { followers: data.followers, following: data.following, username: incomingUser, importedAt: syncStamp || new Date().toISOString() }
  persistAccount(accountRec)
  if (!currentAccountUsername.value || currentAccountUsername.value.toLowerCase() === incomingUser.toLowerCase()) {
    currentAccountUsername.value = incomingUser
    recordPreviousSnapshot()
    followers.value = data.followers; following.value = data.following; importedAt.value = accountRec.importedAt
    saveCurrentAccount(accountRec)
  }
}

setInterval(checkForExtensionSync, 3000)
void checkForExtensionSync()

export function useAudienceData() {
  const connections = computed(() => analyzeFollowers(followers.value, following.value))
  const notFollowingBack = computed(() => connections.value.notFollowingBack.filter(p => !whitelist.value.has(normalizeUsername(p.username))))
  const notFollowedBack = computed(() => connections.value.notFollowedBack)
  const mutuals = computed(() => connections.value.mutuals)
  const changes = computed(() => compareFollowers(previous.value, followers.value))
  const newFollowers = computed(() => changes.value.newFollowers)
  const lostFollowers = computed(() => changes.value.lostFollowers)
  const ghostFollowers = computed(() => identifyGhostFollowers(followers.value, following.value).filter(p => !whitelist.value.has(normalizeUsername(p.username))))

  const allAccounts = computed(() => {
    const map = new Map<string, Person>()
    for (const p of [...following.value, ...followers.value]) map.set(normalizeUsername(p.username), p)
    return [...map.values()]
  })

  const whitelistedPeople = computed(() => {
    const map = new Map<string, Person>()
    for (const p of [...following.value, ...followers.value]) map.set(normalizeUsername(p.username), p)
    return [...whitelist.value].map(u => map.get(u) || { username: u, href: `https://www.instagram.com/${encodeURIComponent(u)}/` })
  })

  function toggleWhitelist(username: string) {
    const norm = normalizeUsername(username)
    if (whitelist.value.has(norm)) whitelist.value.delete(norm); else whitelist.value.add(norm)
    saveWhitelist(whitelist.value)
  }

  async function importFiles(files: FileList | File[]) {
    error.value = ''; loading.value = true
    try {
      const selected = Array.from(files)
      if (!selected.length) return
      const groups = await readInstagramFiles(selected)
      if (!groups.has('followers') || !groups.has('following')) throw new Error('Please select your followers and following export files (e.g. followers_1.json and following.json or the export ZIP).')
      recordPreviousSnapshot()
      followers.value = groups.get('followers')!; following.value = groups.get('following')!; importedAt.value = new Date().toISOString()
      saveCurrentAccount({ followers: followers.value, following: following.value, importedAt: importedAt.value })
    } catch (e) { error.value = e instanceof Error ? e.message : 'Could not read these files.' }
    finally { loading.value = false }
  }

  function loadSampleData() {
    const { record, previous: prevSnap } = createSampleAudienceData()
    currentAccountUsername.value = record.username; followers.value = record.followers; following.value = record.following
    previous.value = prevSnap; importedAt.value = record.importedAt
    persistAccount(record); saveCurrentAccount(record); savePreviousSnapshot(prevSnap)
  }

  function switchAccount(username: string) {
    const target = savedAccounts.value[(username || '').toLowerCase()]
    if (!target) return
    recordPreviousSnapshot()
    currentAccountUsername.value = target.username; followers.value = target.followers || []; following.value = target.following || []
    importedAt.value = target.importedAt || new Date().toISOString()
    saveCurrentAccount(target)
  }

  function removeAccount(username: string) {
    const norm = (username || '').toLowerCase()
    delete savedAccounts.value[norm]
    saveAccountsMap(savedAccounts.value)
    if (currentAccountUsername.value.toLowerCase() === norm) {
      const remaining = Object.values(savedAccounts.value)
      if (remaining.length > 0) switchAccount(remaining[0].username)
      else { followers.value = []; following.value = []; currentAccountUsername.value = ''; importedAt.value = ''; previous.value = null; clearCurrentAccount() }
    }
  }

  async function refreshCurrentAccount() {
    if (!currentAccountUsername.value) return
    loading.value = true; error.value = ''
    try {
      const data = await fetchAccountSync(currentAccountUsername.value)
      followers.value = data.followers || []; following.value = data.following || []; importedAt.value = data.syncedAt || new Date().toISOString()
      const updated: AccountRecord = { followers: followers.value, following: following.value, username: currentAccountUsername.value, importedAt: importedAt.value }
      persistAccount(updated); saveCurrentAccount(updated)
    } catch (e) { error.value = e instanceof Error ? e.message : 'Refresh failed.' }
    finally { loading.value = false }
  }

  function resetData() {
    if (!confirm('Remove imported Instagram data from this browser?')) return
    followers.value = []; following.value = []; currentAccountUsername.value = ''; previous.value = null; importedAt.value = ''
    whitelist.value.clear(); savedAccounts.value = {}; clearAudienceStorage()
  }

  const savedAccountsList = computed(() => Object.values(savedAccounts.value).map(acc => ({
    username: acc.username, followersCount: acc.followers?.length || 0, followingCount: acc.following?.length || 0, syncedAt: acc.importedAt
  })))

  return {
    followers, following, currentAccountUsername, savedAccounts, savedAccountsList, switchAccount, removeAccount,
    refreshCurrentAccount, previous, whitelist, importedAt, loading, error, notFollowingBack, notFollowedBack, mutuals,
    newFollowers, lostFollowers, ghostFollowers, allAccounts, whitelistedPeople, toggleWhitelist, importFiles, loadSampleData, resetData
  }
}
