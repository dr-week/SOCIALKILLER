/**
 * Visual Bot v2 — Self-Healing 3-Layer Cascade Resolver (<105 lines)
 * Tier 1: Cached semantic CSS selector (<5ms)
 * Tier 2: Stagehand-style Set-of-Mark A11y DOM indexer (<20ms) -> self-heals Tier 1 cache
 * Tier 3: Theme-invariant Sobel + 2D NCC edge matcher (<50ms)
 */
import { matchEdgeTemplate } from './canvas-contour.js'
import { indexInteractiveDom, isSensitiveElement, querySemanticMark } from './set-of-mark.js'

export function resolveTargetWithCascade({
  query = '',
  cachedSelector = '',
  root = typeof document !== 'undefined' ? document : null,
  templateEdgeData = null,
  sceneEdgeData = null,
  onHealSelector = null
} = {}) {
  const start = performance.now()

  // Layer 1: Fast cached selector lookup with fail-closed sensitive guard
  if (cachedSelector && root?.querySelector) {
    try {
      const el = root.querySelector(cachedSelector)
      if (el && !isSensitiveElement(el)) {
        const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { x: 0, y: 0, width: 10, height: 10 }
        if (rect.width > 0 && rect.height > 0) {
          return {
            found: true,
            layer: 1,
            selector: cachedSelector,
            healed: false,
            rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
            durationMs: Number((performance.now() - start).toFixed(2))
          }
        }
      }
    } catch {}
  }

  // Layer 2: Set-of-Mark Semantic DOM fallback + self-healing cache update
  if (query && root?.querySelectorAll) {
    const indexed = indexInteractiveDom(root)
    const match = querySemanticMark(indexed.marks, query)
    if (match && match.matchScore >= 20) {
      if (typeof onHealSelector === 'function' && match.selector) {
        try { onHealSelector(match.selector, match) } catch {}
      }
      return {
        found: true,
        layer: 2,
        selector: match.selector,
        healed: true,
        mark: match,
        rect: match.rect,
        blockedCount: indexed.blockedCount,
        durationMs: Number((performance.now() - start).toFixed(2))
      }
    }
  }

  // Layer 3: Theme-invariant Sobel + 2D NCC visual fallback
  if (sceneEdgeData && templateEdgeData) {
    const res = matchEdgeTemplate(
      sceneEdgeData.edges,
      sceneEdgeData.width,
      sceneEdgeData.height,
      templateEdgeData.edges,
      templateEdgeData.width,
      templateEdgeData.height
    )
    if (res.found) {
      return {
        found: true,
        layer: 3,
        healed: false,
        confidence: res.confidence,
        center: res.center,
        rect: res.box,
        durationMs: Number((performance.now() - start).toFixed(2))
      }
    }
  }

  return {
    found: false,
    layer: 0,
    healed: false,
    durationMs: Number((performance.now() - start).toFixed(2))
  }
}
