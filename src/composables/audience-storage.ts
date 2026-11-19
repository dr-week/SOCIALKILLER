import type { Person, Snapshot } from '../domain/followers'
import type { AccountRecord } from '../types'

const KEYS = {
  accounts: 'followdesk-accounts',
  current: 'followdesk-current',
  previous: 'followdesk-previous',
  whitelist: 'followdesk-whitelist',
  status: 'followdesk-account-status'
}

export function loadAudienceStorage() {
  let savedAccounts: Record<string, AccountRecord> = {}
  let current: Partial<AccountRecord> | null = null
  let previous: Snapshot | null = null
  let whitelist = new Set<string>()
  try {
    const rawAccounts = localStorage.getItem(KEYS.accounts)
    if (rawAccounts) savedAccounts = JSON.parse(rawAccounts)
    const rawCurrent = localStorage.getItem(KEYS.current)
    if (rawCurrent) {
      current = JSON.parse(rawCurrent) as AccountRecord
      if (current.username && !savedAccounts[current.username.toLowerCase()]) {
        savedAccounts[current.username.toLowerCase()] = current as AccountRecord
      }
    }
    const rawPrevious = localStorage.getItem(KEYS.previous)
    if (rawPrevious) previous = JSON.parse(rawPrevious) as Snapshot
    const rawWhitelist = localStorage.getItem(KEYS.whitelist)
    if (rawWhitelist) whitelist = new Set(JSON.parse(rawWhitelist) as string[])
  } catch {
    localStorage.removeItem(KEYS.current)
    localStorage.removeItem(KEYS.previous)
  }
  return { savedAccounts, current, previous, whitelist }
}

export const saveAccountsMap = (map: Record<string, AccountRecord>) => { try { localStorage.setItem(KEYS.accounts, JSON.stringify(map)) } catch {} }
export const saveCurrentAccount = (data: Partial<AccountRecord>) => localStorage.setItem(KEYS.current, JSON.stringify(data))
export const savePreviousSnapshot = (snapshot: Snapshot) => localStorage.setItem(KEYS.previous, JSON.stringify(snapshot))
export const saveWhitelist = (items: Set<string>) => localStorage.setItem(KEYS.whitelist, JSON.stringify([...items]))
export const clearCurrentAccount = () => localStorage.removeItem(KEYS.current)

export function clearAudienceStorage() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
}

const ig = (u: string): Person => ({ username: u, href: `https://www.instagram.com/${u}/` })

export function createSampleAudienceData() {
  const followers = ['alex_creator', 'design_studio_nyc', 'sarah_travels', 'hyperdrive_studio', 'mark_coder', 'photo_luna', 'emma_art', 'dan_music'].map(ig)
  const following = ['alex_creator', 'sarah_travels', 'hyperdrive_studio', 'natgeo', 'apple', 'nasa', 'dan_music', 'techcrunch'].map(ig)
  const prevFollowers = ['alex_creator', 'sarah_travels', 'hyperdrive_studio', 'old_friend_99', 'mark_coder'].map(ig)
  const importedAt = new Date().toISOString()
  const record: AccountRecord = { followers, following, importedAt, username: 'alex_creator' }
  const previous: Snapshot = { date: new Date(Date.now() - 7 * 86400000).toISOString(), followers: prevFollowers, following }
  return { record, previous }
}
