// Web Worker for Non-Blocking Set Analytics
// Performs O(N) hashtable difference and snapshot comparisons off the main thread
// so the UI never drops frames even when analyzing 100,000+ accounts.

export type Person = { username: string; href: string; timestamp?: number }
export type Snapshot = { date: string; followers: Person[]; following: Person[] }

export interface AnalyzePayload {
  followers: Person[]
  following: Person[]
  previous: Snapshot | null
  whitelist: string[]
}

const normalize = (u: string) => u.trim().replace(/^@/, '').toLowerCase()

self.onmessage = (event: MessageEvent<AnalyzePayload>) => {
  const { followers, following, previous, whitelist } = event.data

  const whitelistSet = new Set(whitelist.map(normalize))
  const followerSet = new Set<string>()
  for (let i = 0; i < followers.length; i++) {
    followerSet.add(normalize(followers[i].username))
  }

  const followingSet = new Set<string>()
  for (let i = 0; i < following.length; i++) {
    followingSet.add(normalize(following[i].username))
  }

  // 1. Connection sets
  const notFollowingBack: Person[] = []
  const mutuals: Person[] = []
  for (let i = 0; i < following.length; i++) {
    const person = following[i]
    const norm = normalize(person.username)
    if (followerSet.has(norm)) {
      mutuals.push(person)
    } else if (!whitelistSet.has(norm)) {
      notFollowingBack.push(person)
    }
  }

  const notFollowedBack: Person[] = []
  for (let i = 0; i < followers.length; i++) {
    const person = followers[i]
    if (!followingSet.has(normalize(person.username))) {
      notFollowedBack.push(person)
    }
  }

  // 2. Snapshot diffing
  const newFollowers: Person[] = []
  const lostFollowers: Person[] = []

  if (previous && Array.isArray(previous.followers)) {
    const prevFollowerSet = new Set(previous.followers.map(p => normalize(p.username)))
    for (let i = 0; i < followers.length; i++) {
      if (!prevFollowerSet.has(normalize(followers[i].username))) {
        newFollowers.push(followers[i])
      }
    }
    for (let i = 0; i < previous.followers.length; i++) {
      if (!followerSet.has(normalize(previous.followers[i].username))) {
        lostFollowers.push(previous.followers[i])
      }
    }
  }

  self.postMessage({
    notFollowingBack,
    notFollowedBack,
    mutuals,
    newFollowers,
    lostFollowers
  })
}
