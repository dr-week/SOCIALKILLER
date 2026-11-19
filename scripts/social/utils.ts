/**
 * Shared HTTP & text utilities for the multi-platform social publisher.
 * Handles exponential backoff on HTTP 429 / 5xx, hashtag formatting, and safe truncation.
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  timeoutMs?: number
}

export async function fetchWithBackoff(
  url: string,
  init: RequestInit = {},
  options: RetryOptions = {}
): Promise<Response> {
  const maxRetries = options.maxRetries ?? 3
  const baseDelayMs = options.baseDelayMs ?? 800
  const timeoutMs = options.timeoutMs ?? 15000

  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal
      })
      clearTimeout(timer)

      // Handle rate limiting (429) or transient server errors (502/503/504)
      if (
        (response.status === 429 ||
          response.status === 502 ||
          response.status === 503 ||
          response.status === 504) &&
        attempt < maxRetries
      ) {
        const retryAfterHeader = response.headers.get('retry-after')
        const retryAfterSec = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : NaN
        const waitMs = !Number.isNaN(retryAfterSec)
          ? retryAfterSec * 1000
          : baseDelayMs * Math.pow(2, attempt)
        await new Promise(r => setTimeout(r, Math.min(waitMs, 10000)))
        continue
      }

      return response
    } catch (err) {
      clearTimeout(timer)
      lastError = err
      if (attempt < maxRetries) {
        const waitMs = baseDelayMs * Math.pow(2, attempt)
        await new Promise(r => setTimeout(r, waitMs))
        continue
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`HTTP request failed after ${maxRetries} retries: ${url}`)
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const cleaned = raw.trim().replace(/^#+/, '').replace(/\s+/g, '')
    if (!cleaned) continue
    const lower = cleaned.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    out.push(`#${cleaned}`)
  }
  return out
}

export function truncateText(text: string, maxLength: number): string {
  const clean = text.trim()
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function escapeTelegramMarkdownV2(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export function hexToDiscordColorInt(hex = '#a855f7'): number {
  const cleaned = hex.trim().replace(/^#/, '')
  const parsed = Number.parseInt(cleaned, 16)
  return Number.isNaN(parsed) ? 0xa855f7 : parsed
}

/**
 * Splits long text into a Twitter/X 280-char micro-thread if needed,
 * or returns a single 280-char post with hashtags and link.
 */
export function buildTwitterMicroThread(
  title: string,
  summary: string,
  url: string,
  tags: string[]
): string[] {
  const hashBlock = normalizeTags(tags).slice(0, 4).join(' ')
  const suffixParts = [url.trim(), hashBlock].filter(Boolean)
  const suffix = suffixParts.length ? `\n\n${suffixParts.join('\n')}` : ''

  const head = title.trim() ? `🚀 ${title.trim()}\n\n${summary.trim()}` : summary.trim()
  const fullSingle = `${head}${suffix}`

  if (fullSingle.length <= 280) {
    return [fullSingle]
  }

  // Fit into single tweet if summary alone + suffix <= 280
  const maxHeadLen = 280 - suffix.length
  if (maxHeadLen >= 80) {
    return [`${truncateText(head, maxHeadLen)}${suffix}`]
  }

  // Otherwise return a 2-tweet micro-thread
  const tweet1 = truncateText(head, 275)
  const tweet2 = truncateText(`🔗 ${url.trim()}\n\n${hashBlock}`.trim(), 280)
  return [tweet1, tweet2]
}
