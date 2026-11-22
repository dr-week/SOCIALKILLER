/**
 * Safe Unfollow Visual Bot SoM Highlight Bridge (<65 lines)
 * Visually highlights the Instagram "Following" control when opened from
 * SOCIALKILLER Safe Unfollow Assistant (#sk_review=1) for 1-click human confirmation.
 * Never clicks automatically; preserves 100% human-in-the-loop safety.
 */
;(function initUnfollowHighlightBridge() {
  if (window.__socialkillerUnfollowHighlightLoaded) return
  window.__socialkillerUnfollowHighlightLoaded = true

  const RING_ATTR = 'data-sk-following-highlight'

  function findFollowingButton() {
    const buttons = document.querySelectorAll('header button, main header button, [role="button"]')
    for (const btn of buttons) {
      const text = (btn.textContent || '').trim().toLowerCase()
      const aria = (btn.getAttribute('aria-label') || '').toLowerCase()
      if (text === 'following' || text === 'requested' || aria === 'following') {
        const rect = btn.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) return btn
      }
    }
    return null
  }

  function highlightFollowingControl() {
    const btn = findFollowingButton()
    if (!btn || btn.getAttribute(RING_ATTR)) return false
    btn.setAttribute(RING_ATTR, '1')
    btn.style.outline = '2.5px solid #10b981'
    btn.style.outlineOffset = '3px'
    btn.style.boxShadow = '0 0 18px rgba(16, 185, 129, 0.55)'
    btn.style.transition = 'box-shadow 0.25s ease'
    btn.title = 'SOCIALKILLER Safe Review Target — click manually to unfollow'
    return true
  }

  function runIfReviewHash() {
    if (!window.location.hash.includes('sk_review=1')) return
    let attempts = 0
    const timer = setInterval(() => {
      if (highlightFollowingControl() || ++attempts >= 12) clearInterval(timer)
    }, 450)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runIfReviewHash, { once: true })
  else runIfReviewHash()

  if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg?.type === 'SOCIALKILLER_HIGHLIGHT_FOLLOWING') {
        sendResponse({ highlighted: highlightFollowingControl() })
        return true
      }
      return false
    })
  }
})()
