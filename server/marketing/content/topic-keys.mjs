import { createHash } from 'node:crypto'

const COMMON_TOPIC_WORDS = new Set([
  'today', 'latest', 'breaking', 'story', 'news', 'tech', 'new', 'the', 'and', 'for',
  'with', 'from', 'that', 'this', 'into', 'over', 'your', 'our', 'their', 'does', 'what',
  'when', 'where', 'will', 'have', 'most', 'more', 'less', 'about'
])

function hash(value) {
  return createHash('sha256').update(value).digest('hex')
}

export function createTopicKey(title) {
  const normalized = String(title || '').normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  return hash(normalized)
}

export function createSourceKey(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    url.username = ''
    url.password = ''
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key)
    url.hash = ''
    url.searchParams.sort()
    return hash(url.href.replace(/\/$/, ''))
  } catch { return '' }
}

export function createContentHash(text) {
  return hash(String(text || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim())
}

export function isNearDuplicateTopic(candidate, previous) {
  const tokens = value => new Set(String(value || '').normalize('NFKD').toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(word => !COMMON_TOPIC_WORDS.has(word)) || [])
  const next = tokens(candidate)
  const prior = tokens(previous)
  if (next.size < 3 || prior.size < 3) return false
  let shared = 0
  for (const word of next) if (prior.has(word)) shared++
  return shared >= 3 && shared / Math.min(next.size, prior.size) >= 0.75
}
