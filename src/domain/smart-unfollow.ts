import type { Person } from './followers'
import type { AccountStatus } from '../types'

const normalizeHandle = (username: string) => username.trim().toLowerCase().replace(/^@/, '')

export interface SmartUnfollowRules {
  protectWhitelisted: boolean
  protectRecentDays: number
  protectCreators: boolean
  ghostsOnly: boolean
  batchSize: number
}

export interface ScoredUnfollowTarget {
  person: Person
  priorityScore: number
  reasons: string[]
}

export interface SmartBatchResult {
  batch: ScoredUnfollowTarget[]
  totalEligible: number
  protectedCount: number
  ghostCount: number
  deadCount: number
}

const CREATOR_HANDLE_PATTERN = /(official|studio|labs|media|news|magazine|brand|hq|agency|collective|dev|design)$/i

export const DEFAULT_SMART_RULES: SmartUnfollowRules = {
  protectWhitelisted: true,
  protectRecentDays: 7,
  protectCreators: true,
  ghostsOnly: false,
  batchSize: 25
}

export function isRecentFollow(person: Person, protectRecentDays: number, nowSec = Math.floor(Date.now() / 1000)): boolean {
  if (protectRecentDays <= 0 || !person.timestamp) return false
  const ageDays = (nowSec - person.timestamp) / 86400
  return ageDays >= 0 && ageDays < protectRecentDays
}

export function isProtectedCreator(username: string): boolean {
  return CREATOR_HANDLE_PATTERN.test(normalizeHandle(username))
}

export function buildSmartUnfollowBatch(params: {
  candidates: Person[]
  ghostUsernames: Set<string>
  whitelistSet: Set<string>
  accountStatusMap?: Map<string, AccountStatus>
  rules?: Partial<SmartUnfollowRules>
  nowSec?: number
}): SmartBatchResult {
  const rules: SmartUnfollowRules = { ...DEFAULT_SMART_RULES, ...(params.rules || {}) }
  const nowSec = params.nowSec ?? Math.floor(Date.now() / 1000)

  const eligible: ScoredUnfollowTarget[] = []
  let protectedCount = 0
  let ghostCount = 0
  let deadCount = 0

  for (const person of params.candidates) {
    const norm = normalizeHandle(person.username)
    if (!norm) continue

    if (rules.protectWhitelisted && params.whitelistSet.has(norm)) {
      protectedCount++
      continue
    }
    if (isRecentFollow(person, rules.protectRecentDays, nowSec)) {
      protectedCount++
      continue
    }
    if (rules.protectCreators && isProtectedCreator(norm)) {
      protectedCount++
      continue
    }

    const isGhost = params.ghostUsernames.has(norm)
    const accountStatus = params.accountStatusMap?.get(norm)
    const isDead = accountStatus?.status === 'deactivated'

    if (rules.ghostsOnly && !isGhost && !isDead) continue

    let priorityScore = 10
    const reasons: string[] = []
    if (isDead) {
      priorityScore += 45
      deadCount++
      reasons.push('404 / Deleted')
    }
    if (isGhost) {
      priorityScore += 35
      ghostCount++
      reasons.push('Ghost pattern')
    }
    if (person.timestamp && (nowSec - person.timestamp) / 86400 > 30) {
      priorityScore += 20
      reasons.push('30d+ non-follower')
    }
    if (!reasons.length) reasons.push('Non-follower')

    eligible.push({ person, priorityScore, reasons })
  }

  eligible.sort((a, b) => b.priorityScore - a.priorityScore || a.person.username.localeCompare(b.person.username))
  const cap = Math.max(1, rules.batchSize)

  return {
    batch: eligible.slice(0, cap),
    totalEligible: eligible.length,
    protectedCount,
    ghostCount,
    deadCount
  }
}
