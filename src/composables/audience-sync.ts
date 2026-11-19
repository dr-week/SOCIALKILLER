import type { Person } from '../domain/followers'

export interface SyncedPayload {
  username?: string
  followers: Person[]
  following: Person[]
  syncedAt?: string
}

export async function fetchExtensionSync(): Promise<SyncedPayload | null> {
  try {
    const res = await fetch('/api/instagram/sync')
    if (!res.ok) return null
    const json = await res.json()
    return json.synced && json.data ? (json.data as SyncedPayload) : null
  } catch {
    return null
  }
}

export async function fetchAccountSync(username: string): Promise<SyncedPayload> {
  const res = await fetch(`/api/instagram/sync?username=${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error('Could not contact sync server.')
  const json = await res.json()
  if (json.synced && json.data) return json.data as SyncedPayload
  throw new Error(`No recent scan found on backend for @${username}. Open Instagram on their profile and click Scan in SOCIALKILLER companion.`)
}
