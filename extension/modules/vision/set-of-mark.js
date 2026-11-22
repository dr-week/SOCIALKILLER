/**
 * Stagehand-style Set-of-Mark (SoM) Semantic DOM Indexer (Extension Layer 2, <115 lines)
 * Indexes visible interactive controls with deterministic numeric marks (#1, #2, ...)
 * while strictly redacting password, OTP, payment, and destructive controls.
 */

const BLOCKED_INPUT_TYPES = new Set(['password', 'hidden'])
const UNSAFE_LABEL_RE = /\b(password|passcode|otp|2fa|cvv|card number|credit card|ssn|wire transfer|delete account|pay now)\b/i

export function isSensitiveElement(el) {
  if (!el) return true
  const tag = (el.tagName || '').toLowerCase()
  const type = (el.getAttribute?.('type') || '').toLowerCase()
  if (tag === 'input' && BLOCKED_INPUT_TYPES.has(type)) return true

  const autocomplete = (el.getAttribute?.('autocomplete') || '').toLowerCase()
  if (autocomplete.includes('password') || autocomplete.includes('cc-') || autocomplete.includes('one-time-code')) {
    return true
  }

  const combined = [
    el.getAttribute?.('aria-label'),
    el.getAttribute?.('name'),
    el.getAttribute?.('placeholder'),
    el.textContent?.slice(0, 80)
  ].filter(Boolean).join(' ')
  return UNSAFE_LABEL_RE.test(combined)
}

export function extractSemanticLabel(el) {
  const candidates = [
    el.getAttribute?.('aria-label'),
    el.getAttribute?.('title'),
    el.getAttribute?.('placeholder'),
    el.textContent?.trim()?.replace(/\s+/g, ' ').slice(0, 64)
  ]
  return candidates.find(Boolean) || (el.tagName || 'element').toLowerCase()
}

export function buildSafeSelector(el) {
  const testId = el.getAttribute?.('data-testid')
  if (testId) return `[data-testid="${testId}"]`
  const aria = el.getAttribute?.('aria-label')
  if (aria) return `${(el.tagName || '').toLowerCase()}[aria-label="${aria.slice(0, 48)}"]`
  if (el.id) return `#${el.id}`
  const role = el.getAttribute?.('role')
  if (role) return `${(el.tagName || '').toLowerCase()}[role="${role}"]`
  return (el.tagName || 'div').toLowerCase()
}

export function indexInteractiveDom(root = document, { maxMarks = 60 } = {}) {
  const selector = 'button, a[href], input, textarea, [role="button"], [role="textbox"], [contenteditable="true"]'
  const nodes = Array.from(root.querySelectorAll?.(selector) || [])
  const marks = []
  let blockedCount = 0

  for (const el of nodes) {
    if (marks.length >= maxMarks) break
    if (isSensitiveElement(el)) { blockedCount++; continue }

    const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { x: 0, y: 0, width: 100, height: 32 }
    if (rect.width <= 0 || rect.height <= 0) continue

    const id = marks.length + 1
    marks.push({
      markId: id,
      tag: (el.tagName || '').toLowerCase(),
      role: el.getAttribute?.('role') || (el.tagName || '').toLowerCase(),
      label: extractSemanticLabel(el),
      selector: buildSafeSelector(el),
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    })
  }

  return { marks, totalIndexed: marks.length, blockedCount }
}

export function querySemanticMark(marks, query) {
  const needle = (query || '').trim().toLowerCase()
  if (!needle) return null
  const tokens = needle.split(/\s+/).filter(Boolean)

  let best = null
  let bestScore = 0
  for (const mark of marks) {
    const hay = `${mark.label} ${mark.role} ${mark.selector}`.toLowerCase()
    let score = 0
    if (hay === needle) score += 100
    else if (hay.includes(needle)) score += 60
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 20
    }
    if (score > bestScore) { bestScore = score; best = mark }
  }
  return best ? { ...best, matchScore: bestScore } : null
}
